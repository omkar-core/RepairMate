# AGENTS.md — Project Custom Instructions

These rules apply to every AI coding tool, agent, and human contributor working in
this repository. Follow them without exception. When in doubt, the file these rules
sit beside — the actual code — wins over anything an AI model generalizes.

---

## 1. Style & Implementation Rules (always apply)

1. **Use emojis instead of SVG icons.** Do not introduce new SVG icon components or
   inlined `<svg>` elements. Prefer emoji characters (e.g. 🛠️ 🔍 ⚠️ ✅) for UI glyphs.
2. **Do NOT change model strings found in code.** Model identifiers such as
   `gemini-3-flash-preview` (the `GEMINI_MODEL` default) are load-bearing strings.
   Never rename, "upgrade", or paraphrase them unless the user explicitly asks and a
   working key for the new model exists.
3. **Avoid using gradients.** New code must not use CSS/Tailwind gradient utilities
   (`bg-gradient-to-*`, `bg-clip-text` with gradient colors, `linear-gradient`, etc.).
4. Use the **YAGNI checklist** before adding anything:
   1. Does this need to exist? → no: skip it (YAGNI)
   2. Already in this codebase? → reuse it, don't rewrite
   3. Stdlib does it? → use it
   4. Native platform feature? → use it
   5. Installed dependency? → use it
   6. One line? → one line
   7. Only then: the minimum that works

## 2. Strict Security Rules

1. **Never expose sensitive credentials in frontend or client-side code.** Do NOT
   expose: OpenAI API keys, Gemini/OpenRouter keys, Stripe secret keys, MongoDB
   connection URLs, Firebase admin credentials, JWT secrets, or any environment
   variable containing a secret. All secrets must remain **server-side only** using
   secure backend environment variables.
2. **Use a secure backend architecture.** All API requests pass through protected
   backend endpoints. Authentication middleware and role-based access control are
   applied where required. Validate and sanitize every incoming request.
3. **Prevent abuse and spam attacks.** Rate limiting on all APIs. Prevent unlimited
   requests from a single IP/user/device. Request throttling and cooldowns. Protect
   against bot spam and DDoS-style abuse. CAPTCHA/bot detection where needed.
4. **Protect the database from malicious actions.** Prevent NoSQL/SQL injection.
   Never execute raw user queries. Use parameterized queries/ORM validation.
   Least-privilege access. Validate all schemas before storing data.
5. **Prevent malicious file and data uploads.** Restrict file types and sizes. Scan
   uploads before processing. Prevent executable/script uploads. Sanitize
   user-generated content.
6. **Secure authentication and sessions.** Strong password hashing (bcrypt/argon2).
   Secure JWT/session handling. Token expiry and refresh flow. Prevent session
   hijacking and credential leaks.
7. **Protect against common web vulnerabilities.** XSS, CSRF, SSRF, command
   injection, path traversal, and unauthorized API access.
8. **Logging and monitoring.** Log suspicious activity securely. Detect repeated
   failed requests. Error handling without exposing internal server details.
9. **Production deployment rules.** HTTPS only. Secrets in `.env`/secret managers.
   Never commit secrets to GitHub. Configure CORS securely. Disable debug mode in
   production.
10. **Code quality.** Scalable folder structure. Modular, maintainable code.
    Comments for critical security logic. TypeScript where possible. Optimized
    performance and API efficiency.

The application must be secure, scalable, abuse-resistant, and production-ready.

## 3. Architecture Reference (read before editing)

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Motion (`motion/react`) + Lucide
  (existing icons only — see rule 1). Entry: `src/main.tsx` → `src/App.tsx`.
- **State flow:** `App.tsx` owns `appState` (`landing | camera | loading | dashboard | error`),
  `analysis`, `messages`, and `capturedImage`. Components are presentational and
  receive props/callbacks.
- **API client:** `src/services/api.ts` posts to `/api/analyze` and `/api/chat`
  (proxied to the server in dev, same-origin in production).
- **Backend:** Express server in `server/` — `config.ts`, `gemini.ts` (Google GenAI
  SDK, `@google/genai`), `validation.ts` (input sanitization), `index.ts` (routes,
  rate limits, helmet, CORS). The same app runs standalone (`npm start`) and as a
  Vercel serverless function via `api/index.ts`.
- **Types:** `RepairAnalysis` + `Message` live in `src/types.ts` (mirrored in
  `server/gemini.ts`). Do not drift the two copies.

## 4. Commands

```bash
npm run dev            # web (vite, :3000) + API (:3001) concurrently
npm run build          # tsc --noEmit && vite build && tsup server bundle
npm start              # serve API + built frontend from build/
npm test               # vitest run (server + services)
npm run typecheck      # tsc --noEmit
npm run lighthouse     # lhci autorun (performance/a11y/SEO audit)
```

## 5. AI-Assist Tooling Wired Into This Repo

- **Context7** — up-to-date library/API docs for the model. Configured (disabled by
  default) in `.mcp.json` and `opencode.json`. Enable and add a key from
  https://context7.com/dashboard.
- **Graphify** — codebase knowledge graph for the model. Configured (disabled by
  default) in `.mcp.json` and `opencode.json`. Requires `pip install graphifyy`,
  `graphify build`, then the client serves `graphify-out/graph.json`.
- **Lighthouse** — `npm run lighthouse` audits performance/accessibility/SEO.
- **21st.dev** — component registry; only pull shadcn-compatible components per the
  YAGNI checklist and never to bypass existing components.

## 6. Conventions

- Secrets live only in `server/` via `process.env` read through `server/config.ts`
  and in `.env` (git-ignored). Never use `VITE_` for secrets. Never commit `.env`.
- Every user-facing AI/network boundary is validated: client sends a strict payload,
  server re-validates with `server/validation.ts` (mime whitelist, byte limits, text
  length/turn limits), and rate limits apply per endpoint.
- Log levels: `LOG_LEVEL=info` logs all requests; anything else logs 4xx/5xx only.
- Model/API string constants: `GEMINI_MODEL` (default `gemini-3-flash-preview`) —
  see rule 1.2.