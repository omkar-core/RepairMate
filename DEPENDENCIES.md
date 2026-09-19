# DEPENDENCIES.md

Managed via `npm`. Node engine: **≥ 20** (`package.json` → `engines`).

## Runtime dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` ^19 | UI framework. |
| `react-markdown` ^10 | Assistant message markdown rendering. |
| `motion` ^12 | Animation library (`motion/react`). |
| `lucide-react` ^0.546 | Existing icon set (legacy policy — no new SVG icons; see AGENTS.md). |
| `clsx` + `tailwind-merge` ^2/^3 | `cn()` class joining in `MessageBubble`. |
| `@google/genai` ^1.29 | Google Gemini SDK (server). Powering `server/gemini.ts`. |
| `express` ^5 | API framework. |
| `helmet` ^8 | Security headers + CSP. |
| `cors` ^2 | Origin allow-listing. |
| `express-rate-limit` ^8 | Per-endpoint rate limiting. |
| `dotenv` ^18 | `.env` loading in `server/config.ts`. |
| `@tailwindcss/vite` ^4, `@tailwindcss/typography` ^0.5, `vite` ^6, `@vitejs/plugin-react` ^5 | Build toolchain. |

## Dev dependencies

| Package | Purpose |
|---------|---------|
| `typescript` ~5.8 | Type checking (`tsc --noEmit`). |
| `vitest` ^5 | Test runner. |
| `tsx` ^4 | Dev server on TS (`tsx watch server/index.ts`). |
| `tsup` ^8.5 | Bundle the server (`build/server/index.js`). |
| `concurrently` ^10 | Run web + API together in `npm run dev`. |
| `@lhci/cli` ^0.14 | Lighthouse CI audits (`npm run lighthouse`). |
| `@types/express`, `@types/cors`, `@types/node` | Typings. |
| `tailwindcss` ^4, `autoprefixer` ^10 | Styling. |

## Dependency rules

1. **Do not add a dependency if stdlib, the platform, or an existing package
   already covers it** (YAGNI checklist, AGENTS.md §1.4).
2. New runtime packages must be justifiable in this doc and approved in review.
3. Keep `overrides` minimal (`glob`, `node-domexception`, `esbuild` pins exist for
   transitive CVEs / compat); do not add overrides casually.
4. `npm ci` on a fresh checkout must work — never commit a broken lockfile.
5. Audit: `npm audit` is checked during install/release reviews. Do not
   `npm audit fix --force` (upgrades breaking majors silently).