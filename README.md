# ♠ 大模型掼蛋挑战赛

> **想直接上手？打开 [https://guandan.yao-yang.cn/](https://guandan.yao-yang.cn/) 就能玩** —— 无需注册，填一个模型 API Key 即可开局，四个 AI 同桌对战，真人随时可以加入牌桌。

让 DeepSeek、Kimi、MiniMax、StepFun 四个大模型坐在同一张桌上打一局真正的掼蛋。每个 AI 都是会用工具的 Agent——自己看牌、理牌、拆牌、出牌，每局打完自动复盘、沉淀经验，越打越有牌感。

## 这个项目能干什么

一张牌桌，两种玩法：

- **🥊 模型评测场**：谁牌技硬，打一局就知道。同一个牌桌、同一副牌、同一套规则，把不同模型换上桌，风格打法高下立判；每个决策全程可见，经验记忆随时可清空，保证各家公平起跑。
- **🧠 牌神养成场**：锁住一个模型，在这台电脑上一局局陪它打。每局结束自动复盘、把得失提炼成经验，越打越有牌感——练久了，它就成了一位只属于你的牌神 agent。

## 核心特性

- **真正的 Agent，不是规则引擎**：每位 AI 手里握着 8 个工具——看牌、理牌、拆牌、出牌、过牌、查历史、读经验、记经验。每个决策都是一次真实的工具调用，全程流式可见，不玩黑箱；非法出牌会被内置规则引擎当场拦截，双重校验。
- **跨局记忆，按模型独立保存**：每局结束 AI 自动复盘，把组牌优先级、出牌节奏、博弈取舍提炼成经验存下来。同一个模型换到任何座位，经验都会跟随；换了新模型，就从零开始学。
- **人机混战，任意组合**：四个座位随便配——全 AI 观战、人机混战、人人对战都可以，桌上点击 AI 标识还能围观它的完整决策过程、直接向它提问。
- **数据只存在你的浏览器里**：不用注册、不传数据。API Key 存 Cookie（30 天不用自动清除，每次使用自动续期），AI 经验、座位配置、对局战绩存 localStorage，随时可查可删。

## 支持的模型

| 服务商 | 默认模型 | 可选模型 |
| --- | --- | --- |
| DeepSeek | deepseek-v4-flash | deepseek-v4-pro |
| Kimi（Moonshot） | moonshot-v1-32k | moonshot-v1-128k / kimi-latest / kimi-k2-thinking-turbo |
| MiniMax Token Plan | MiniMax-M2.5-highspeed | MiniMax-M2.5 / M2.7 / M2.7-highspeed |
| StepFun Step Plan | step-3.7-flash | step-3.5-flash-2603 / step-3.5-flash / step-1o-turbo-vision |

只需配置至少一家服务商的 API Key 即可开局（没单独指定的座位会自动挑选已配置的模型），也可以在牌桌上给每个座位单独指定服务商与模型。

## 掼蛋规则

- 两副牌 108 张，4 人对战，对家组队（南↔北、东↔西），任意一人先出完即队伍获胜
- 每局限定一个「级牌」（2→A 升级），级牌大于 A、小于小王；红心级牌是「逢人配」，可当任意牌凑型
- 双上连升 3 级、一三游连升 2 级、一四游升 1 级；头游出完后一圈人都不要，队友「接风」
- 完整规则细节内置到每位 AI 的系统提示词中，规则引擎双重校验

## 技术架构

纯静态站点，**没有后端**：浏览器直接 HTTPS 调用各家 OpenAI 兼容接口（实测 CORS 支持），全部游戏逻辑与数据存储都在浏览器内完成。

```
public/
├── index.html    # 首页：项目介绍、参赛阵容、本机战绩
├── config.html   # 模型 Key 配置与数据管理（Key 缓存 / AI 记忆 / 全局操作）
├── game.html     # 牌桌：对局、座位配置、AI 决策围观、战绩统计
├── js/common.js  # 共享模块：Provider 定义、Cookie / localStorage 工具
└── vendor/       # Bootstrap、jQuery 本地静态资源
```

## 本地运行

项目是纯静态页面，任意静态服务器托管 `public/` 目录即可：

```bash
cd public
python3 -m http.server 8080
# 或：caddy file_server --listen :8080
```

然后打开 http://localhost:8080 。注意模型调用是浏览器直连各家 API，从 localhost 页面也能直接调用。

## 部署

- 生产站点：[https://guandan.yao-yang.cn/](https://guandan.yao-yang.cn/)
- `project/guandan.Caddyfile`：Caddy 静态托管配置（`root * /var/www/guandan_challenge/public`，gzip 压缩）
- `project/after_push.sh`：部署脚本，软链 Caddyfile 并 reload；站点暂无后端进程，将来加 Node 后端时参照此脚本扩展

## License

MIT
