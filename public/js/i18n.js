/* ================================================================
 * 掼蛋挑战赛 — 国际化模块（按浏览器语言自动切换 中文 / English）
 *
 * 约定：
 *  - 翻译 key = 中文原文。语言为 zh 时 t() 原样返回 key（无需中文词典）；
 *    为 en 时查 window.I18N_EN[key]，查不到则回退原文（漏翻只影响英文显示）。
 *  - 静态 HTML：元素加 data-i18n（文本）/ data-i18n-ph（placeholder）/
 *    data-i18n-title / data-i18n-aria；含内联标签（<br>/<span>）的元素
 *    用 data-i18n-html（key 为任意语义标识，zh 时保留原 HTML，
 *    en 时用词典值整体替换，词典值自带相同标签）。
 *  - JS 文案：统一 t("中文原文", { name: 值 })，插值用 {name} 占位。
 *  - 语言识别：navigator.language 以 zh 开头 → zh，否则 en；
 *    可用 URL 参数 ?lang=zh|en 覆盖（测试用）。
 * ================================================================ */

(function () {
  // ---------- 语言识别 ----------
  function detectLang() {
    try {
      const params = new URLSearchParams(location.search);
      const forced = params.get("lang");
      if (forced === "zh" || forced === "en") return forced;
    } catch (e) {}
    const nav = (navigator.language || navigator.languages?.[0] || "zh").toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  window.LANG = detectLang();
  window.I18N = window.I18N || {};

  // ---------- 翻译函数 ----------
  // t("中文原文", { name: "南" }) → zh: 原文插值；en: 查词典（缺失回退原文）
  window.t = function (key, vars) {
    let out = key;
    if (window.LANG === "en" && window.I18N_EN && window.I18N_EN[key] !== undefined) {
      out = window.I18N_EN[key];
    }
    if (vars) {
      for (const k in vars) {
        out = out.split("{" + k + "}").join(String(vars[k]));
      }
    }
    return out;
  };

  // ---------- 应用到静态 DOM ----------
  function applyI18n() {
    document.documentElement.lang = window.LANG === "zh" ? "zh-CN" : "en";

    // <title> / meta description（HTML 中写 data-i18n / data-i18n-meta）
    const title = document.querySelector("title");
    if (title && title.hasAttribute("data-i18n")) {
      title.textContent = t(title.getAttribute("data-i18n"));
    }
    const desc = document.querySelector('meta[name="description"]');
    if (desc && desc.hasAttribute("data-i18n-meta")) {
      desc.content = t(desc.getAttribute("data-i18n-meta"));
    }

    // 元素文本 / placeholder / title / aria-label
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-html");
      // zh：保留原始 HTML（key 只是语义标识，无中文词典可查）
      if (window.LANG === "zh") return;
      if (window.I18N_EN && window.I18N_EN[key] !== undefined) {
        el.innerHTML = window.I18N_EN[key];
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyI18n);
  } else {
    applyI18n();
  }
})();
