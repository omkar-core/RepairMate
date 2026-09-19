# SECURITY.md

Security is the top non-functional requirement of RepairMate AI. This document is
authoritative and maps each requirement to its concrete implementation.

## 1. Secrets handling

- **Server-side only.** The Gemini API key and any future credentials live in
  environment variables read through `server/config.ts`. Never in client code,
  never prefixed `VITE_`, never in the bundle.
- `.env` is git-ignored; only `.env.example` (with placeholders) is committed.
- Do not log keys, tokens, or request bodies containing base64 image data.

## 2. Secure backend architecture

- Every request enters through `server/index.ts` global middleware:
  `helmet` (CSP, headers) → `cors` (whitelisted origins) → `express.json`
  (10 MB body cap) → global rate limiter → request logger → routes.
- All AI calls happen server-side (`server/gemini.ts`); the client only talks to
  our own endpoints (`src/services/api.ts`).

## 3. Abuse & spam prevention

- `express-rate-limit` with separate limiters:
  - Global: 120 req / 15 min (`RATE_LIMIT_*`)
  - `/api/analyze`: 8 req / min (`ANALYZE_*`)
  - `/api/chat`: 30 req / min (`CHAT_*`)
- `TRUST_PROXY=true` (production behind Vercel/nginx) so rate limiting uses the
  real client IP.
- 429 responses are explicit and configurable.

## 4. Injection protection

- No database. When the DB phase lands (see `DATABASE.md`) it MUST use an ORM /
  parameterized queries only.
- No raw user queries, no `eval`, no template-eval of user input on the server.
- All text is control-character-stripped via `cleanText` in `server/validation.ts`.

## 5. Upload safety

- `server/validation.ts` enforces:
  - Data-URL shape only (`parseDataUrl`), no arbitrary file paths/URLs.
  - Mime whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`.
  - Decoded byte cap (default 5 MB, `MAX_IMAGE_BYTES`).
  - Prompt ≤ 2000 chars, message ≤ 4000 chars, ≤ 40 history turns, part text
    ≤ 2000 chars.
- Client resizes images to ≤1024px JPEG (q 0.8) before upload, keeping payloads
  small and consistent.

## 6. Auth & sessions

- No user accounts in v1 (stateless). Any future auth MUST use bcrypt/argon2
  password hashing, expiring + refreshable tokens, and session-hijack protections
  before merging.

## 7. Common vulnerability protections

| Threat | Mitigation |
|--------|-----------|
| XSS | React escaping, CSP (`default-src 'self'`, `object-src 'none'`), markdown rendered client-side with react-markdown. |
| CSRF | Same-origin JSON API, `Content-Type: application/json`, CORS allow-list, `frame-ancestors 'none'`. |
| SSRF | No server-side URL fetching of user input (demo images are fetched client-side). |
| Command injection | No child-process execution of user input. |
| Path traversal | Static serving only from `dist/` via `express.static`; no user-supplied paths. |
| Unauthorized access | Whitelist CORS origins, rate limits, generic 404 for unknown endpoints. |
| DoS | Rate limiting, payload caps, request-length HTML body limits. |

## 8. Logging & monitoring

- Request log middleware logs method, path, status, duration, and `req.ip`
  (only ISO timestamp + the minimal fields; never request bodies).
- `LOG_LEVEL=info` logs all requests; anything else logs only 4xx/5xx.
- Unhandled errors are logged at server console (`err.stack`) but clients receive
  a generic message only.

## 9. Production rules

- HTTPS enforced at the platform (Vercel) layer.
- Secrets via platform env vars / `.env`; never committed.
- `NODE_ENV=production` enables helmet CSP and static serving.
- CSP `connect-src 'self'` keeps the client talking only to its own origin.

## 10. Code quality

- Modular server layout (`index`, `config`, `gemini`, `validation`) with a thin
  serverless adapter (`api/index.ts`).
- TypeScript with `strict` on the server; shared types mirrored and checked.

## Security.txt

Published at `/.well-known/security.txt` (see `public/.well-known/`).