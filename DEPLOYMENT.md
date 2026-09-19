# DEPLOYMENT.md

The same codebase deploys three ways: local dev, a standalone Node server, and
Vercel (static frontend + serverless API).

## 1. Local development

```bash
npm install
cp .env.example .env       # add your GEMINI_API_KEY
npm run dev
```

- Web: http://localhost:3000 (Vite; proxies `/api` → `:3001` via `vite.config.ts`).
- API: http://localhost:3001 (Express via `tsx watch`).
- Without a key, `/api/analyze` and `/api/chat` return 503 (by design).

## 2. Standalone Node server (single process)

```bash
npm run build      # tsc + vite build + tsup server bundle
npm start          # node build/server/index.js
```

Serves both the API and the built frontend from `dist/` (API on `PORT`, default
3001 — set `PORT=3000` if you want the app on a single port). Static hosting is
enabled when `NODE_ENV=production` or `SERVE_STATIC=true`.

Use `TRUST_PROXY=true` behind nginx/Cloud Run/Render so rate limiting sees real
client IPs.

## 3. Vercel (current production)

Repo layout:

- `api/index.ts` — re-exports the Express `app` as a serverless function.
- `vercel.json` — caps function `maxDuration` at 30 s.
- Vercel serves `dist/` assets statically and routes `/api/*` to the function.

Scripts to run locally per deploy machine:

```bash
npm ci && npm run build
```

Deploy steps:

1. Connect repo → project (settings: Node 20+, `npm ci` install).
2. Set environment variables (Project → Settings → Environment Variables):
   - `GEMINI_API_KEY` (required)
   - `NODE_ENV=production`
   - `TRUST_PROXY=true`
   - `CORS_ORIGIN` — your production origin, or leave empty for dev defaults
     (same-origin calls are unaffected by CORS).
   - Optional: `MAX_IMAGE_BYTES`, `MAX_BODY_BYTES`, `RATE_LIMIT_*`,
     `LOG_LEVEL`, `APP_URL`.
3. Deploy the branch. The build runs `vite build`; Vercel auto-detects
   `api/` for the serverless function.
4. Verify: `GET /api/health` returns `{"status":"ok","geminiConfigured":true}`
   and `POST /api/analyze` works from the app.

### Why the API previously 404'd on Vercel

Before `api/index.ts` + `vercel.json` existed, deploys were static-only: the
frontend shipped but `/api/*` had no handler. If you see API failures on a Vercel
deployment, confirm the deployed branch includes these files and environment
variables.

## 4. Environment matrix

| Var | Dev | Vercel |
|-----|-----|--------|
| `GEMINI_API_KEY` | `.env` | Project env var |
| `NODE_ENV` | development | production |
| `PORT` | 3001 | (managed) |
| `TRUST_PROXY` | false | true |
| `LOG_LEVEL` | info | info |

Full reference: `ENVIRONMENT.md` and `.env.example`.

## 5. Release checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` green
- [ ] `npm run build` green (tsc + vite + tsup)
- [ ] `npm run lighthouse` thresholds met (see `.lighthouserc.json`)
- [ ] `CHANGELOG.md` updated, `MEMORY.md` gotchas annotated
- [ ] Secrets never committed (grep the diff for `GEMINI_API_KEY=` literals)