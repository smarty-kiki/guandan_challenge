/* ================================================================
 * 掼蛋挑战赛 — 共享模块
 * 页面：index.html / config.html / game.html
 *
 * 存储约定（与参考项目一致，全部在浏览器本地）：
 *  - Cookie：大模型 API Key（保存 30 天，每次使用自动续期到 30 天）
 *  - localStorage：与 Agent 记忆 / 页面配置相关的数据
 *
 * 大模型接口：全部浏览器直接 HTTPS 调用（CORS 实测支持，无需后端）
 * ================================================================ */

// ---------- Cookie 名称 ----------
const KIMI_API_KEY_COOKIE_NAME = "kimi_api_key";
const MINIMAX_TOKEN_PLAN_API_KEY_COOKIE_NAME = "minimax_token_plan_api_key";
const DEEPSEEK_API_KEY_COOKIE_NAME = "deepseek_api_key";
const STEPFUN_API_KEY_COOKIE_NAME = "stepfun_api_key";

const API_KEY_COOKIE_DAYS = 30; // Key 有效期：30 天，使用即续期

// ---------- Provider 定义 ----------
// 四个大模型服务商，全部 OpenAI 兼容接口，浏览器直连
const PROVIDER_ORDER = ["kimi", "minimax", "deepseek", "stepfun"];
const PROVIDER_CONFIGS = {
  kimi: {
    id: "kimi", label: "Kimi（Moonshot）", shortLabel: "Kimi",
    apiUrl: "https://api.moonshot.cn/v1/chat/completions",
    cookieName: KIMI_API_KEY_COOKIE_NAME,
    defaultModel: "moonshot-v1-32k",
    defaultContextSize: 131072,
    modelOptions: [
      { value: "moonshot-v1-32k", label: "moonshot-v1-32k（快、便宜）", contextSize: 32768 },
      { value: "moonshot-v1-128k", label: "moonshot-v1-128k（稳、上下文长）", contextSize: 131072 },
      { value: "kimi-latest", label: "kimi-latest（通用）", contextSize: 131072 },
      { value: "kimi-k2-thinking-turbo", label: "kimi-k2-thinking-turbo（推理强、较慢）", contextSize: 131072 }
    ],
    modelFallbacks: ["moonshot-v1-128k", "kimi-latest", "kimi-k2-thinking-turbo"],
    useResponseFormat: true
  },
  minimax: {
    id: "minimax", label: "MiniMax Token Plan", shortLabel: "MiniMax",
    apiUrl: "https://api.minimaxi.com/v1/chat/completions",
    cookieName: MINIMAX_TOKEN_PLAN_API_KEY_COOKIE_NAME,
    defaultModel: "MiniMax-M2.5-highspeed",
    defaultContextSize: 204800,
    modelOptions: [
      { value: "MiniMax-M2.5-highspeed", label: "MiniMax-M2.5-highspeed（快）", contextSize: 204800 },
      { value: "MiniMax-M2.5", label: "MiniMax-M2.5（稳定）", contextSize: 204800 },
      { value: "MiniMax-M2.7-highspeed", label: "MiniMax-M2.7-highspeed（强、快）", contextSize: 204800 },
      { value: "MiniMax-M2.7", label: "MiniMax-M2.7（强）", contextSize: 204800 }
    ],
    modelFallbacks: ["MiniMax-M2.5", "MiniMax-M2.1", "MiniMax-M2"],
    useResponseFormat: false
  },
  deepseek: {
    id: "deepseek", label: "DeepSeek", shortLabel: "DeepSeek",
    apiUrl: "https://api.deepseek.com/chat/completions",
    cookieName: DEEPSEEK_API_KEY_COOKIE_NAME,
    defaultModel: "deepseek-v4-flash",
    defaultContextSize: 1000000,
    modelOptions: [
      { value: "deepseek-v4-flash", label: "deepseek-v4-flash（默认、快、便宜）", contextSize: 1000000 },
      { value: "deepseek-v4-pro", label: "deepseek-v4-pro（更强推理/代码）", contextSize: 1000000 }
    ],
    modelFallbacks: ["deepseek-v4-pro"],
    useResponseFormat: true
  },
  stepfun: {
    id: "stepfun", label: "StepFun Step Plan", shortLabel: "StepFun",
    apiUrl: "https://api.stepfun.com/v1/chat/completions",
    cookieName: STEPFUN_API_KEY_COOKIE_NAME,
    defaultModel: "step-3.7-flash",
    defaultContextSize: 262144,
    modelOptions: [
      { value: "step-3.7-flash", label: "step-3.7-flash（旗舰、256K）", contextSize: 262144 },
      { value: "step-3.5-flash-2603", label: "step-3.5-flash-2603（Agent 优化、快）", contextSize: 262144 },
      { value: "step-3.5-flash", label: "step-3.5-flash（便宜、256K）", contextSize: 262144 },
      { value: "step-1o-turbo-vision", label: "step-1o-turbo-vision（32K）", contextSize: 32768 }
    ],
    modelFallbacks: ["step-3.5-flash-2603", "step-3.5-flash"],
    useResponseFormat: true
  }
};

// ---------- Cookie 工具 ----------
function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const item of cookies) {
    const idx = item.indexOf("=");
    if (idx === -1) continue;
    const key = item.substring(0, idx);
    if (key === name) return decodeURIComponent(item.substring(idx + 1));
  }
  return "";
}

// 保存 Cookie，默认有效期 30 天
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
}

// 续期：把某个 provider 的 API Key Cookie 重新写到 30 天（有 Key 才续）
function touchProviderCookie(providerId) {
  const config = PROVIDER_CONFIGS[providerId];
  if (!config) return false;
  const key = getCookie(config.cookieName).trim();
  if (!key) return false;
  setCookie(config.cookieName, key, API_KEY_COOKIE_DAYS);
  return true;
}

// 续期所有已配置的 Key（页面打开时调用："每次打开页面自动延长"）
function touchAllProviderCookies() {
  let touched = 0;
  for (const id of PROVIDER_ORDER) {
    if (touchProviderCookie(id)) touched++;
  }
  return touched;
}

// ---------- Provider 工具 ----------
function getProviderConfig(providerId) {
  return PROVIDER_CONFIGS[providerId] || null;
}

function getProviderApiKey(providerId) {
  const config = getProviderConfig(providerId);
  if (!config) return "";
  return getCookie(config.cookieName).trim();
}

function getProviderShortLabel(providerId) {
  const config = getProviderConfig(providerId);
  return config ? config.shortLabel : providerId;
}

// 各模型上下文大小不同（32K～1M token），用于按模型计算压缩阈值
function getModelContextSize(providerId, modelName) {
  const config = getProviderConfig(providerId);
  if (!config) return 131072;
  for (const opt of config.modelOptions) {
    if (opt.value === modelName && opt.contextSize) return opt.contextSize;
  }
  return config.defaultContextSize || 131072;
}

// 已配置了 Key 的 provider 列表
function getAvailableProviders() {
  return PROVIDER_ORDER.filter(id => getProviderApiKey(id));
}

// 是否配置了任意 Key
function hasAnyApiKey() {
  return getAvailableProviders().length > 0;
}

// ---------- localStorage 工具（Agent 记忆 / 页面配置） ----------
function lsGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

function lsGetJSON(key, fallback) {
  try {
    const raw = lsGet(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function lsSetJSON(key, obj) {
  try { return lsSet(key, JSON.stringify(obj)); } catch (e) { return false; }
}
