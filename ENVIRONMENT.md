# ENVIRONMENT.md

All configuration flows through `server/config.ts` (single source of truth) and
is documented in `.env.example`. Copy `.env.example` → `.env` for local work.

> **Security:** never commit `.env`. Only `.env.example` (placeholders) is
> tracked. Never create `VITE_` variables for secrets.

## Required

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (server-side only). Get one at https://aistudio.google.com/apikey. Without it, analysis/chat return 503. |

## Optional — server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express listen port. |
| `GEMINI_MODEL` | `gemini-3-flash-preview` | Model identifier — load-bearing, do not change casually. |
| `CORS_ORIGIN` | dev defaults | Comma-separated allowed browser origins. Empty → `http://localhost:3000`, `:5173`, `127.0.0.1:3000`. |
| `TRUST_PROXY` | `false` | `true` behind Vercel/nginx so rate limiting uses the real client IP. |
| `LOG_LEVEL` | `info` | `info` logs all requests; anything else logs 4xx/5xx only. |
| `SERVE_STATIC` | `false` (auto-on in production) | Serve `dist/` statically from the Express server. |
| `DISABLE_HMR` | unset | `true` disables Vite HMR (niche). |

## Optional — rate limits

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Global window (15 min). |
| `RATE_LIMIT_MAX` | `120` | Global max requests / window. |
| `ANALYZE_RATE_LIMIT_WINDOW_MS` | `60000` | `/api/analyze` window. |
| `ANALYZE_RATE_LIMIT_MAX` | `8` | `/api/analyze` max / window. |
| `CHAT_RATE_LIMIT_WINDOW_MS` | `60000` | `/api/chat` window. |
| `CHAT_RATE_LIMIT_MAX` | `30` | `/api/chat` max / window. |

## Optional — payload limits

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_IMAGE_BYTES` | `5242880` (5 MB) | Max decoded image bytes accepted. |
| `MAX_BODY_BYTES` | `10485760` (10 MB) | Max JSON request body (Express `json` limit). |

## Optional — frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Only set when the API lives on a different origin (no proxy/same-origin). |
| `APP_URL` | `https://repair-mate-seven.vercel.app` | Public app URL used in docs/metadata (not a secret). |

## AI-tooling keys (optional, for developers)

| Variable | Tool | Purpose |
|----------|------|---------|
| `CONTEXT7_API_KEY` | Context7 MCP (`opencode.json`, `.mcp.json`) | Higher rate limits for docs lookup. Get from https://context7.com/dashboard. |

## Conventions

- Boolean vars: accept `true`/`1` (`asBool`).
- Integer vars: invalid/negative fall back to defaults (`asInt`).
- Unknown variables are ignored; unknown behavior is not introduced.
- Secrets never appear in logs, responses, or the bundle.