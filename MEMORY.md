# MEMORY.md — Decisions & State Log

Running ledger of decisions, constraints, and gotchas that contributors and AI
agents must remember across sessions. If something surprises you while working in
this repo, add it here.

## Constraints (do not break)

- **Model string is load-bearing:** default `gemini-3-flash-preview`
  (`GEMINI_MODEL`). Never change/rename (see `AGENTS.md` rule 1.2).
- **`RepairAnalysis` exists twice** — `src/types.ts` and `server/gemini.ts`.
  They mirror each other. Any drift is a bug. Keep them in sync atomically.
- **No `VITE_` secrets, ever.** The frontend bundle must not contain the Gemini
  key or any credential.
- **Client never calls Gemini directly.** Only `src/services/api.ts` → server.
- **Middleware order in `server/index.ts` is load-bearing** — do not reorder
  helmet/cors/json/rate-limit/log.
- **Existing UI uses gradients + lucide icons.** The `AGENTS.md` style rules apply
  to *new* code. Refactoring legacy visuals is its own task, never bundled in.

## Architecture decisions (ADR-style)

1. **Stateless backend, no database.** Analysis + chat history live in client
   state only. Chosen for v1 (YAGNI). Revisit only with real auth/persistence
   requirements — see `PHASES.md` Phase 9 and `DATABASE.md`.
2. **Structured JSON over free text.** Gemini returns JSON via `responseSchema` so
   the frontend renders a dashboard instead of parsing prose.
3. **Image quality gate.** If `imageQuality.isClear === false`, the UI shows a
   mean-times-helpful retake screen and never a hallucinated diagnosis.
4. **Same Express app, two runtimes.** `server/index.ts` exports `app`; it only
   calls `listen()` when executed as the main entry. `api/index.ts` re-exports it
   for Vercel serverless so behavior stays identical.
5. **Whitelist validation on every boundary.** Mime whitelist
   (`image/jpeg|png|webp|gif|avif`), decoded-byte caps, prompt/message/turn limits
   in `server/validation.ts`.

## Gotchas & past failures

- **Empty-message chat bug (fixed):** `validateChatPayload` treated `message: ""`
   as "has a message" because it only checked `typeof === 'string'`. Now checks
   non-empty trim while still allowing image-only chats.
- **Vercel API 404 risk:** the repo previously had no serverless entry; on a plain
   static Vercel deploy `/api/*` returned 404. Fixed by `api/index.ts` +
   `vercel.json`. If the deployed app reports API errors, confirm the branch deploy
   includes these files.
- **Stale `build/server/index.js`:** always rebuild (`npm run build`) before
   `npm start`; the committed copy can lag the source.
- **`npm start` did not serve static assets (fixed):** the built server at
   `build/server/index.js` resolved `../dist` relative to the bundle
   (`build/dist` — doesn't exist), so `NODE_ENV=production` runs 404'd `/`.
   `server/index.ts` now resolves `dist` from `process.cwd()` with a
   bundle-relative fallback (`resolveDistDir`). Verify with
   `NODE_ENV=production` + `npm start`, then fetch `/`.
- **New skeleton code must stay gradient-free:** `SkeletonLoaders.tsx` uses solid
   `bg-zinc-800` + `animate-pulse` only. Keep new skeleton markup consistent with
   that rule if you extend it.
- **CSP must allow the demo's Unsplash fetches:** the demo cards POST to the
   server, which `fetch`es `images.unsplash.com`. Keep that domain in `connect-src`
   in *both* `server/index.ts` and the `vercel.json` header CSP; the two must not
   drift or production (Vercel) will block the demo image.
- **SPA fallback is now a real 404 for unknown paths:** `server/index.ts` serves
   `index.html` only for `/`; other plain GETs return a JSON 404 (no more
   soft-404s). Any new top-level client route must be handled by client-side
   routing from `/`, not by added server falls.
- **Structured response headers:** every Express response ships CSP,
   Permissions-Policy, Referrer-Policy, nosniff. `vercel.json` mirrors the CSP +
   Permissions-Policy on static responses. If you change one, change both.

## How to verify your change is complete

- `npm run typecheck` — no TS errors (client + server via `tsconfig.server.json`
  if needed).
- `npm test` — all vitest suites green (currently 26 tests).
- `npm run build` — bundling + tsup server bundle succeed.
- For production behavior: `npm run build && npm start`, hit `/api/health`.