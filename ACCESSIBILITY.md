# ACCESSIBILITY.md

Accessibility goals and the concrete state of the UI. Lighthouse
`categories:accessibility` ≥ 0.9 is an **error-level** gate in
`.lighthouserc.json`.

## Baseline practices

- **Semantic structure:** `header`, `main`, `h1`–`h4` headings in the dashboard
  hierarchy; buttons are native `<button>` elements (not divs).
- **Labels & alt text:** all images carry `alt` (device photos, avatar images,
  demo thumbs have readable names). Icon buttons include `title`/aria labels.
- **Perceivable text:** dark theme with zinc–700 gauge:
  - secondary text `text-zinc-400` on `zinc-950` (≥ 4.5:1); headings white.
  - status colors (emerald/red/amber) are always paired with a text label, never
    color alone.
- **Keyboard operability:** chat submit, suggestion chips, tool/step toggles,
  camera buttons all reachable + focused via `focus:ring` / `focus-within`.
- **Motion:** `motion/react` transitions update transforms/opacity only; the
  loading screen's infinite animation is decorative and short-lived. Honor
  `prefers-reduced-motion` where feasible (wrap decorative springs with
  `useReducedMotion` in future work).
- **Drag & drop is additive:** an always-visible file input and camera button
  exist; drop zones only enhance, never gate (keyboard/AT users can still upload).
- **Touch targets:** primary controls ≥ 44px; icon buttons padded to ≥ 40px hit
  area.

## Known considerations

- The camera view requires `getUserMedia`; failure shows a clear error with a
  Retry button and upload remains available.
- Voice input (Web Speech API) is progressive enhancement; the text input is the
  primary path. When unsupported, the mic button is not rendered.
- Prose (markdown) styling from `@tailwindcss/typography` sets readable
  line-lengths and spacing for assistant answers.

## Verification

- `npm run lighthouse` runs the accessibility audit (error ≥ 0.9).
- Manual QA on a keyboard-only flow: landing → upload → dashboard steps → chat.
- Keep new UI within the same tokens (zinc/cyan/status palette) so contrast and
  semantics don't regress.