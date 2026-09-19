# AI_RULES.md — Rules for AI-Generated Code & AI Model Behavior

This file governs how AI assistants (opencode, Cursor, Claude Code, v0, Lovable,
Bolt, etc.) should behave in this repo. `AGENTS.md` is the normative short version;
this file expands with rationale.

## 1. Model & prompt integrity

- **Never change model strings.** `GEMINI_MODEL` defaults to
  `gemini-3-flash-preview`; the SDK client name/import (`@google/genai`) and
  `SYSTEM_INSTRUCTION` are all load-bearing. Only the user may ask for a model
  change, and only with a working key.
- Do not add proxy layers or wrappers around `server/gemini.ts` without a reason.

## 2. API key & secret discipline

- Keys are read strictly via `server/config.ts` from `process.env`.
- `VITE_` prefixed variables must NEVER hold secrets.
- `.env` files are never committed. Only `.env.example` (placeholders) is tracked.
- If you see a key in a diff/commit, flag it immediately — do not "fix forward".

## 3. UI generation rules (AGENTS.md §1)

1. **Emojis instead of SVG icons** — new glyphs are emoji characters.
2. **No gradients** — no Tailwind `bg-gradient-*`, no `bg-clip-text` gradient text,
   no `linear-gradient`. Use flat colors, borders, blur glows, and shadows instead.
3. Reuse existing components (`MessageBubble`, `ChatInput`, dashboard cards) before
   inventing new ones. Do not import new icon/UI libraries to bypass existing
   patterns; for shadcn-style components consult 21st.dev only per the YAGNI
   checklist.

## 4. Backend code rules

- Keep every user-facing route behind `server/validation.ts` + a rate limiter.
- Do not weaken middleware (helmet, CORS, rate limits) "to make it work" — fix
  config instead.
- Error responses must stay generic; log the real detail server-side.
- No raw `fetch` in the browser to anything but our API (`src/services/api.ts`).

## 5. How to work with this repo (for AI agents)

1. Read `AGENTS.md` + `RULES.md` first.
2. Run `npm run typecheck` and `npm test` after changes.
3. Keep both `RepairAnalysis` copies in sync.
4. Update `API.md`, `CHANGELOG.md`, `MEMORY.md` when behavior changes.
5. When unsure whether a feature is needed, apply the YAGNI checklist
   (AGENTS.md §1.4) and prefer the minimal implementation.

## 6. Required AI-assist tooling

Configured (disabled by default) in `.mcp.json` / `opencode.json`:

- **Context7** — always prefer it for up-to-date library API docs before writing
  code against `@google/genai`, `express`, `motion`, `react-markdown`, etc.
- **Graphify** — use the codebase graph to navigate instead of guessing
  conventions; run `graphify build` after significant restructuring.
- **21st.dev** — allowed only for shadcn-compatible components that genuinely do
  not exist in-repo and pass the YAGNI checklist.