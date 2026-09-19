# PHASES.md — Roadmap & Milestones

Status tracking for the Rep​airMate AI build-out. Each phase is production-verified
(typecheck + tests + Lighthouse) before the next starts.

## Phase 1 — Foundation ✅ (complete)

- React 19 + Vite + Tailwind v4 scaffold, `App.tsx` state machine
  (`landing | camera | loading | dashboard | error`).
- Landing page with camera / upload / drag-drop / demo images.
- Camera capture → downscaled JPEG data URL.

## Phase 2 — Backend & Secure API ✅ (complete)

- Express 5 API on `:3001` with helmet, CORS, JSON limit.
- Config-driven env (`server/config.ts`) with safe defaults.
- `POST /api/analyze` returning structured `RepairAnalysis`.
- `POST /api/chat` with conversation history + optional image.
- Per-endpoint rate limiting; error handling without leaking internals.

## Phase 3 — Gemini Multimodal Integration ✅ (complete)

- `@google/genai` client; `SYSTEM_INSTRUCTION` + `responseSchema` (JSON mode).
- Image quality gate and structured dashboard rendering.
- Context-aware follow-up chat with image attachment and voice input.
- Share / download repair guide.

## Phase 4 — Hardening & Validation ✅ (complete)

- `server/validation.ts`: data-URL parser, mime whitelist, byte/length/turn caps.
- Vitest suite for server validation + API client (26 tests).
- Image quality fallback to the error screen instead of hallucinated results.

## Phase 5 — Production Integration ✅ (complete)

- Standalone server + static hosting (`npm start`).
- Vercel serverless entry (`api/index.ts`) + `vercel.json`.
- SEO / metadata (`index.html`, `robots.txt`, `sitemap.xml`, `security.txt`).
- Lighthouse CI (`@lhci/cli`, `.lighthouserc.json`, `npm run lighthouse`).

## Phase 6 — AI-Assist Tooling ✅ (complete)

- `AGENTS.md` custom instructions (style, model strings, no-gradients, security).
- MCP configs for Context7 (docs) and Graphify (knowledge graph), disabled by
  default, in `.mcp.json` and `opencode.json`.
- 21st.dev component-registry policy documented (see `RULES.md`, `AGENTS.md`).

## Phase 7 — Documentation System ✅ (complete)

- Full docs set: `PRD`, `ARCHITECTURE`, `RULES`, `DESIGN`, `SECURITY`, `API`,
  `DATABASE`, `AI_RULES`, `ERROR_HANDLING`, `VALIDATION`, `TESTING`,
  `DEPENDENCIES`, `DEPLOYMENT`, `ENVIRONMENT`, `PERFORMANCE`, `ACCESSIBILITY`,
  `SEO`, `CHANGELOG`, `CONTRIBUTING`, `MEMORY`, `LICENSE`.

## Recommended Next Phases (not started)

- **Phase 8 — Observability:** structured JSON request logs, error-rate alerting,
  usage dashboards.
- **Phase 9 — Auth & sessions:** user accounts, saved repair histories
  (requires introducing a database and revisiting `DATABASE.md`).
- **Phase 10 — Expansion:** video diagnosis, AR overlays, multi-language,
  parts marketplace, community repair knowledge base.

Each phase is opt-in: apply the YAGNI checklist before starting. Do not implement
a phase just because it is listed here.