# Architecture

RepairMate AI is a **monolithic repo with a two-part deployment**: a React SPA
frontend and an Express API backend, designed to run identically in local dev,
a standalone Node process, and Vercel serverless.

```
┌────────────────────────────  Browser  ────────────────────────────┐
│  src/App.tsx (appState: landing|camera|loading|dashboard|error)   │
│     ├─ LandingPage        (camera / upload / drag-drop / demo)    │
│     ├─ CameraCapture      (getUserMedia → 1024px JPEG data URL)   │
│     ├─ LoadingScreen      (animated stage messages)               │
│     ├─ AnalysisDashboard  (structured repair plan rendering)      │
│     ├─ ChatInput + MessageBubble (chat + voice + image attach)    │
│     └─ src/services/api.ts → fetch /api/analyze, /api/chat        │
│  Screens load via React.lazy + Suspense; each lazy chunk's        │
│  fallback is a matching skeleton (src/components/SkeletonLoaders).│
└───────────────▲───────────────────────────────────────────────────┘
                │ same origin (/api) in prod; Vite proxy in dev
┌───────────────┴───────────────────────────────────────────────────┐
│  Express app (server/index.ts)                         Node/Vercel│
│     helmet → cors → express.json(limit) → rate limiters          │
│     GET  /api/health                                              │
│     POST /api/analyze   → validateAnalyzePayload → runAnalysis    │
│     POST /api/chat      → validateChatPayload    → runChat        │
│     static dist/* + SPA fallback (standalone mode only)          │
│  lib: config.ts (env) · gemini.ts (GoogleGenAI) · validation.ts   │
└────────────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Frontend (`src/`)

- Entry `src/main.tsx` mounts `src/App.tsx` under React StrictMode.
- `App.tsx` is the single state owner. Presentational components receive
  `onCapture`, `onSendMessage`, `onClose`, etc. as callbacks.
- `src/services/api.ts` is the only network boundary on the client. It uses
  `VITE_API_BASE_URL || '/api'` as base and posts strict payloads
  (`{ prompt, imageUrl }`, `{ history, message, imageUrl }`).
- Images are normalized client-side to ≤1024px JPEG data URLs (q=0.8) before any
  network call.
- Styling: Tailwind CSS v4 (via `@tailwindcss/vite`), theme in `src/index.css`.
  Icons from `lucide-react`; animations from `motion/react`.

### 2. Backend (`server/`)

| File | Responsibility |
|------|----------------|
| `index.ts` | Express app: middleware order, routes, static hosting, error handlers. Exports `app`; only binds a port when run as the main entry. |
| `config.ts` | Reads & validates all environment variables with safe fallbacks. The single source of env truth. |
| `gemini.ts` | Google GenAI client, `SYSTEM_INSTRUCTION`, JSON `responseSchema`, `runAnalysis`, `runChat`. Mirrors `RepairAnalysis`. |
| `validation.ts` | Whitelist-based sanitization: data-URL parsing, mime whitelist, byte limits, prompt/message/turn caps. Pure functions, unit-tested. |

### 3. Deployment topology

- **Local dev:** `npm run dev` → Vite on `:3000` (proxies `/api` → `:3001`) +
  `tsx watch server/index.ts` on `:3001`.
- **Standalone:** `npm run build && npm start` → `node build/server/index.js`
  serves API + `dist/` static.
- **Vercel:** `api/index.ts` exports the Express app as a serverless function;
  `vercel.json` caps runtime. Static assets are served by Vercel's CDN. The same
  Express code detects it is not the main entry and skips `app.listen()`.

## Key invariants

1. `RepairAnalysis` in `src/types.ts` and `server/gemini.ts` MUST stay in sync.
2. All client→AI boundaries go through `src/services/api.ts` → `/api/*` → server
   re-validation. No client-side Gemini calls; no `VITE_` secrets.
3. Middleware order in `server/index.ts` is load-bearing: helmet → cors → json →
   rate limit → request log → routes → static → 404 → error handler.
4. The `api/index.ts` serverless entry must stay a thin re-export of the Express
   app so behaviors never diverge.