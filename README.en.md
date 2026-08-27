# ♠ LLM Guandan Challenge

> **Want to try it right away? Open [https://guandan.yao-yang.cn/](https://guandan.yao-yang.cn/)** — no sign-up needed. Fill in one model API key and you're at the table: four AI players battling it out, with humans free to join at any seat.

DeepSeek, Kimi, MiniMax, and StepFun — four large language models sit down at one table for a real game of Guandan (掼蛋). Each AI is a tool-using agent: it looks at its own hand, organizes it, plays cards, and after every round it reflects on the game and stores what it learned — getting steadily better at the game.

## What this project is for

One table, two ways to play:

- **🥊 Benchmark arena** — Who's got the better card sense? Put different models at the table: same table, same deck, same rules, and their styles are instantly comparable. Every decision is fully visible (no black box), and experience memory can be wiped at any time so everyone starts fair. 
- **🧠 Training ground** — Raise your own card god. Lock in one model and play round after round with it right on this computer: automatic post-game reflection distilled into experience, improving game after game, until it becomes a card-god agent that belongs only to you.

## Highlights

- **A real agent, not a rule engine** — Each AI player holds 8 tools: view hand, arrange cards, split combinations, play, pass, check history, read experience, record experience. Every decision is a genuine tool call, streamed in full view; illegal plays are rejected on the spot by the built-in rule engine (double validation).
- **Cross-game memory, saved per model** — After each round the AI reviews the game and writes down lessons about card-grouping priorities, play tempo, and tactical trade-offs. Memory follows a model across seats; switch to a new model and it starts learning from scratch.
- **Any seating mix** — All four seats are configurable: watch four AIs play it out, play against them, or play human-vs-human. Click an AI's marker at the table to watch its full decision process and even ask it questions directly.
- **Your data stays in your browser** — No account, nothing uploaded. API keys live in a cookie (auto-cleared after 30 days unused, auto-renewed on every use), while AI experience, seat config, and match stats live in localStorage — inspect or delete everything anytime.

## Supported models

| Provider | Default model | Other models |
| --- | --- | --- |
| DeepSeek | deepseek-v4-flash | deepseek-v4-pro |
| Kimi (Moonshot) | moonshot-v1-32k | moonshot-v1-128k / kimi-latest / kimi-k2-thinking-turbo |
| MiniMax Token Plan | MiniMax-M2.5-highspeed | MiniMax-M2.5 / M2.7 / M2.7-highspeed |
| StepFun Step Plan | step-3.7-flash | step-3.5-flash-2603 / step-3.5-flash / step-1o-turbo-vision |

Configure at least one provider's API key and you're ready (unassigned seats automatically pick from configured models). You can also assign a specific provider and model per seat at the table.

## Guandan rules

- Two decks, 108 cards; 4 players, partners sit opposite (South↔North, East↔West). A team wins when either player empties their hand first.
- Each round has a "level card" (escalating 2→A). The level card outranks A and is beaten only by the jokers; the red-heart level card is a wild card that can complete any combination.
- Both partners out first → skip 3 levels; first & third → skip 2; first & fourth → skip 1. If the first-out player's play goes unbeat and everyone passes, the partner "takes over the lead."
- The full rules are baked into each AI's system prompt, with a rule engine providing a second layer of validation.

## Architecture

A pure static site with **no backend**: the browser calls each provider's OpenAI-compatible API over HTTPS directly (CORS is supported in practice), and all game logic and data live in the browser.

```
public/
├── index.html    # Home: intro, lineup, local match stats
├── config.html   # API key configuration & data management (keys / AI memory / global actions)
├── game.html     # The table: matches, seat config, AI decision viewing, stats
├── js/common.js  # Shared module: provider definitions, cookie / localStorage utilities
└── vendor/       # Local Bootstrap & jQuery assets
```

## Run locally

The site is plain static pages — serve the `public/` directory with any static server:

```bash
cd public
python3 -m http.server 8080
# or: caddy file_server --listen :8080
```

Then open http://localhost:8080 . Model calls go straight from the browser to each provider's API, so a localhost page works just as well.

## Deployment

- Production: [https://guandan.yao-yang.cn/](https://guandan.yao-yang.cn/)
- `project/guandan.Caddyfile`: Caddy static hosting config (`root * /var/www/guandan_challenge/public`, gzip)
- `project/after_push.sh`: deploy script — symlinks the Caddyfile and reloads Caddy. There's no backend process yet; if a Node backend is added later, extend this script accordingly.

## License

MIT
