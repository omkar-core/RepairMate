# RULES.md

Project-wide rules for contributors and AI tools. The short version lives in
`AGENTS.md` and is normative for AI agents; this file adds context and rationale.

## 1. Process Rules

1. Never commit secrets, `.env` files, build output, or `node_modules`.
   `.gitignore` covers `build/`, `dist/`, `.env*` (except `.env.example`).
2. Every change must pass `npm run typecheck` and `npm test` before being
   considered done. Add/extend tests when behavior changes.
3. When a type or API shape changes, update BOTH copies of `RepairAnalysis`
   (`src/types.ts` and `server/gemini.ts`) plus `API.md` in the same change.
4. Follow the YAGNI checklist before adding dependencies, components, or docs.
5. Per-endpoint rate limits and input validation are mandatory on any new route
   that accepts user input.

## 2. Style Rules (AI-generated code included)

1. **Emojis, not SVG icons.** New UI glyphs are emoji characters (🛠️ 🔍 ⚠️ ✅).
   Existing `lucide-react` icons stay as-is; do not add new `<svg>` or icon
   components.
2. **Never change model strings.** `gemini-3-flash-preview` (`GEMINI_MODEL` default)
   and the Gemini API key flow are load-bearing. Do not rename, upgrade, or
   paraphrase them.
3. **No gradients.** No `bg-gradient-to-*`, `bg-clip-text` with gradients, or
   `linear-gradient` in new code.
4. Use the existing component and utility patterns (`cn()` from
   `MessageBubble.tsx`, `motion/react`, Tailwind theme tokens from `index.css`).
5. TypeScript everywhere; no `any` where a type exists (server `tsconfig.server.json`
   is `strict`).

## 3. Security Rules

Condensed from `SECURITY.md` (which is authoritative):

1. Secrets are server-side only, via `server/config.ts` + `.env`. Never in client
   code and never prefixed `VITE_`.
2. Validate and sanitize every request at the boundary (`server/validation.ts`).
3. Rate limit every endpoint (`express-rate-limit`).
4. Restrict uploads by mime whitelist and byte size; reject everything else.
5. No raw user queries, no dynamic eval, no shell interpolation of user input.
6. Never log secrets or full request bodies containing base64 images.
7. Errors returned to clients are generic; internal details go to server logs only.

## 4. Folder Conventions

- `src/components/*.tsx` — presentational, receive props/callbacks.
- `src/services/*.ts` — network/side-effect boundaries.
- `server/*.ts` — Express app, config, AI integration, validation.
- `build/`, `dist/` — generated, never hand-edited.
- Root docs (`*.md`) — the decision/contract records listed in `README.md`.

## 5. Conventions Checklist for a New Route / Feature

- [ ] New endpoint added to `server/index.ts` with its own limiter.
- [ ] Payload validated in `server/validation.ts` (mime, size, length caps).
- [ ] Client calls it via `src/services/api.ts` only.
- [ ] `RepairAnalysis` mirror updated if the shape changed.
- [ ] Tests added to `server/validation.test.ts` and/or `src/services/api.test.ts`.
- [ ] `API.md` and `CHANGELOG.md` updated.