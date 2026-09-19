# PERFORMANCE.md

Performance targets and the practices that keep the app fast.

## Targets (Lighthouse, enforced in `.lighthouserc.json`)

| Category | Threshold | Gate |
|----------|-----------|------|
| Performance | ≥ 0.7 | warn |
| Accessibility | ≥ 0.9 | error |
| Best practices | ≥ 0.9 | error |
| SEO | ≥ 0.9 | error |

Run: `npm run build && npm run lighthouse` (audits `vite preview`).

## Bundle

- Production JS ≈ **533 KB** raw (≈ 163 KB gzip) across output chunks after
  `vite build`; the main shell is ≈ 491 KB (≈ 153 KB gzip) and the rest is
  split into per-screen chunks:
  `LandingPage` ≈ 11 KB, `AnalysisDashboard` ≈ 25 KB, `CameraCapture` ≈ 6 KB,
  `LoadingScreen` ≈ 5 KB (gzip ≈ 3.5/6/2.1/1.6 KB).
- Screens split via `React.lazy` + `Suspense` (see `src/App.tsx`); every lazy
  chunk's fallback is a layout-matching skeleton from
  `src/components/SkeletonLoaders.tsx` so deferred chunks render with no blank
  flash and no layout shift (the `@defer`-placeholder pattern).
- `react-markdown` is the largest render-time cost; keep styled content simple.
- If TTI ever needs to drop further, move `react-markdown` into a lazy
  `MessageBubble` and raise the `chunkSizeWarningLimit` (currently 1500 KB in
  `vite.config.ts`).

## Image pipeline (deliberately cheap)

- Client resizes every image to ≤ **1024px** longest side, JPEG q=0.8, before
  upload (camera capture, file upload, drag-drop all use the same `canvas` path).
- Server caps decoded bytes at 5 MB (`MAX_IMAGE_BYTES`); base64 is sent raw
  (no client-side compression beyond the resize). Keeps requests small and
  consistent.

## Network behavior

- `/api/analyze` calls are expensive (Gemini vision); keep the UI loading state
  honest (`LoadingScreen`) and cooldown via the 8 req/min limiter.
- `connect-src 'self'` CSP keeps the client talking only to its own origin.
- External images (demo cards, dicebear avatars) are lazy/fine but content
  delivery is external; mitigate with `loading="lazy"`/static assets where easy.

## Rendering

- `ScrollIntoView` on message append; `AnimatePresence` only where state changes
  (`mode="wait"` in loading screen).
- Staggered entrance animations (`containerVariants`/`itemVariants`) run once at
  mount — do not animate on every keystroke.
- Assure `will-change`/blur-heavy pseudo-elements stay decorative on desktop to
  avoid mobile repaint cost.

## Server

- `express-rate-limit` in-memory store fits the stateless deploy (see
  `DATABASE.md`); per-function cold starts are offset by `@google/genai` client
  re-instantiation guards (module-level cached client keyed by API key).
- `helmet` + static asset caching: `dist/` assets served with `maxAge: '1d'` and
  `no-cache` for HTML/SVG/TXT/XML (see `server/index.ts`).

## Measuring

- Lighthouse CI (`npm run lighthouse`) as the regression gate.
- Server request log gives status + duration per request (`LOG_LEVEL=info`).