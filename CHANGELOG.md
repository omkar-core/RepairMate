# Changelog

All notable changes to this project are documented in this file. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project is
pre-1.0 so breaking changes are expected.

## [Unreleased]

### Added — multimodal upgrade (feature/repairmate-ai-multimodal-upgrade)

- **Camera diagnosis:** full-screen `CameraCapture` with environment camera,
  targeting frame, capture → retake → use flow; frames downscaled to ≤1024px JPEG.
- **Structured AI analysis:** `POST /api/analyze` returns typed `RepairAnalysis`
  (device, components, possible issues + likelihood, repair protocol, safety
  warnings, cost/time, sustainability impact, learning section) via Gemini
  `responseSchema` JSON mode.
- **Image quality gate:** blurry/dark/unidentifiable images land on a friendly
  "retake" screen instead of a fake diagnosis.
- **Context-aware follow-up chat:** `POST /api/chat` with history, markdown
  rendering, image attachment, drag-drop, and voice input (Web Speech API).
- **Share & download** of the repair guide.
- **Lazy-loaded screens with skeleton placeholders:** `React.lazy` + `Suspense`
  code-splits `LandingPage`, `CameraCapture`, `LoadingScreen`, and the heavy
  `AnalysisDashboard` into per-screen chunks. Each `@defer`-style placeholder
  mounts a matching pulsing skeleton (`src/components/SkeletonLoaders.tsx`) so
  chunk loads render consistent, low-CLS placeholders instead of blank flashes —
  main shell JS drops ≈40 KB gzipped.
- **Secure Express backend:** `server/` with `config.ts`, `gemini.ts`,
  `validation.ts`; helmet, CORS allow-list, per-endpoint rate limiting,
  payload caps, structured error handling.
- **Client API boundary:** `src/services/api.ts` + `api.test.ts`.

### Added — tooling & integrations

- **Vercel serverless API** (`api/index.ts`, `vercel.json`) — fixes production
  `/api/*` 404s on static-only deploys.
- **Lighthouse CI** (`@lhci/cli`, `.lighthouserc.json`, `npm run lighthouse`).
- **MCP configs** for Context7 + Graphify (disabled by default) in `.mcp.json`
  and `opencode.json`.
- **`AGENTS.md`** with repo-specific AI instructions (emoji icons, preserve
  model strings, no gradients, security/deployment rules).
- **Documentation set:** PRD, ARCHITECTURE, RULES, PHASES, DESIGN, MEMORY,
  SECURITY, API, DATABASE, AI_RULES, ERROR_HANDLING, VALIDATION, TESTING,
  DEPENDENCIES, DEPLOYMENT, ENVIRONMENT, PERFORMANCE, ACCESSIBILITY, SEO,
  CHANGELOG, CONTRIBUTING, LICENSE.

### Fixed

- `validateChatPayload` now rejects an image-less request whose `message` is
  empty/whitespace (was silently accepted).
- Removed leftover `src/services/geminiService.ts` direct-Gemini client code;
  all calls now go through the secure `/api/*` boundary.

## [Unreleased]

### Added — audit-hardening pass (2026-09)

- **Social card + structured data:** `public/og-image.png` (1200×630) referenced
  by `og:image`/`twitter:image`, plus `SoftwareApplication` JSON-LD schema and
  font `preconnect` hints in `index.html`.
- **Production CSP on static HTML:** `vercel.json` `headers` now ships the same
  Content-Security-Policy the Express server enforces, closing the previously
  header-less static responses. Includes `Permissions-Policy` (camera/microphone
  allowed, everything else denied), `Referrer-Policy: no-referrer`, and
  `X-Content-Type-Options: nosniff`.
- **`Permissions-Policy` response header** on all Express responses
  (`server/index.ts`).

### Fixed — audit-hardening pass (2026-09)

- **Demo-image upload blocked by CSP:** `images.unsplash.com` added to
  `connect-src` in both `server/index.ts` and the `vercel.json` CSP — demo-card
  fetches were going to fail under the production policy.
- **Soft 404s:** the Express SPA fallback now only serves `index.html` for `/`;
  unmatched non-file routes return a real JSON 404 instead of 200+shell.
- **Accessibility:** labeled the chat message input, added accessible names to
  icon-only buttons (camera close/shutter, back), `aria-live` on chat,
  `role="status"` on the typing indicator, Esc-to-close in the camera,
  skip-to-content links on Landing/Dashboard, single `h1` per view, dark-theme
  contrast bumped (`text-zinc-500` → `text-zinc-400`).
- **`security.txt`:** removed the `Policy` link that pointed to a 404 page.

## [1.0.0] — 2026 (previous releases)

### Changed

- Faster responses by switching the analysis model to
  `gemini-3-flash-preview` (git `f7680b7`).
- Enhanced analysis UX and model accuracy (git `ab61fa9`).
- Live demo + Google Live Agent Challenge alignment in README (git `c0f3158`).
- Better error handling and UI feedback (git `0febaf1`).
- Refactored error handling and dependency management (git `4d0336e`).

## [0.x] — pre-history

- Initial React prototype with basic image upload and free-text Gemini output.