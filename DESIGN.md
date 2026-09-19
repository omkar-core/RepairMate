# DESIGN.md — UI/UX & Visual System

## 1. Design language

- **Theme:** dark, zinc-950 base (`#09090b`) with cyan/blue accent ecosystem and
  conditional status colors (emerald/yellow/red/purple).
- **Type:** Outfit (display/headings), Inter (body), JetBrains Mono (mono).
  Loaded in `src/index.css`.
- **Surfaces:** glassmorphism — `bg-zinc-900/40..60`, `backdrop-blur`,
  `border-white/5..20`, layered soft glows via blurred radial divs.
- **Motion:** `motion/react` for staged entrances, spring interactions, and the
  loading ring choreography.

> Note: existing UI predates the "no gradients" rule in `AGENTS.md`. Do not
> introduce new gradient utilities in new code; legacy ones remain until
> intentionally refactored (a pure refactor, never part of a feature task).

## 2. Screen map

| State | Component | Purpose |
|-------|-----------|---------|
| `landing` | `LandingPage` | Hero, Scan Device / Upload Photo, 2 demo examples, "How It Works". |
| `camera` | `CameraCapture` | Full-screen `getUserMedia` with targeting frame, capture → retake/use. |
| `loading` | `LoadingScreen` | Rotating rings + staged messages (detect→identify→diagnose→generate). |
| `dashboard` | `AnalysisDashboard` | Full structured report + chat below in `App.tsx`. |
| `error` | `App` inline | Image-quality or API failure screen with Retake / Cancel. |

## 3. AnalysisDashboard layout

1. **Action bar:** Download / Share (top-right).
2. **Hero card:** image preview with animated fault hotspot + tooltip, device
   name/brand, primary fault callout with likelihood % and location description.
3. **Stats strip:** Difficulty, Est. Time, Est. Cost, AI Confidence.
4. **Safety block:** critical warnings (hidden when none).
5. **Main grid (3 cols → lg):**
   - Left: Required Tools, Detected Components.
   - Right (span 2): Repair Protocol — checkable numbered steps with progress
     counter (`completedSteps` Set in component state).
6. **Value cards:** Pro Advice, Alternatives, Eco Impact (e-waste/carbon), Did You
   Know? (learning section).

## 4. Chat design

- `ChatInput` (fixed bottom): suggestion chips, image attach + drag-drop, voice
  input (Web Speech API), send button.
- `MessageBubble`: user vs assistant styling, optional attached image, markdown
  rendering via `react-markdown` with prose styling.
- Assistant avatar uses dicebear; keep icon usage consistent with the
  emoji-over-SVG policy for anything new.

## 5. Image pipeline (client-side)

1. Source: camera capture, file picker, drag-drop, or demo fetch.
2. Load into `<img>`/`<video>` → draw to canvas capped at **1024px** longest side.
3. Export `image/jpeg` quality 0.8 as data URL.
4. Send to server (which re-validates mime/bytes). Server default max
   decoded image = **5 MB**.

## 6. Accessibility & responsiveness

- Fully responsive: `md:`/`lg:` grid breakpoints, mobile-first flex layouts.
- Keyboard-operable buttons (native `<button>`), semantic headings, alt text on
  images, focus rings (`focus-within`, `focus:ring`).
- Target contrast: zinc-400 secondary text on zinc-950; status colors
  (red/emerald/amber) always paired with text labels, not color alone.