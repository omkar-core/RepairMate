# 🧠 RepairMate AI – Multimodal Repair Assistant Powered by Google Gemini

**RepairMate AI** is a professional engineering and technical repair assistant
powered by Google Gemini (`gemini-3-flash-preview`). Point the camera at a broken
device and get a structured, step-by-step repair plan — plus a context-aware
follow-up chat with voice and image support.

Built for the **Google Live Agent Challenge**, RepairMate AI promotes
sustainability, reduces e-waste, and democratizes repair knowledge.

---

## 🎥 Live Demo

https://repair-mate-seven.vercel.app/

1. Upload or capture an image of a broken device
2. Wait for the AI analysis
3. Review the repair plan (tools, steps, safety, cost)
4. Ask follow-up questions in chat

---

## ✨ Features

- 📸 **Visual diagnostics** — camera capture, file upload, drag & drop, or demo images
- 🧠 **Structured AI analysis** — device, components, likely faults with likelihood,
  difficulty, time, cost, and sustainability impact
- ⚙️ **Interactive repair protocol** — checkable steps, progress counter, share/download
- 💬 **Context-aware chat** — markdown answers, image attachment, voice input (Web Speech API)
- ⚡ **Lazy-loaded screens** — each view is code-split (`React.lazy` + `Suspense`)
  with matching skeleton loaders so deferred chunks render smoothly
- 🛡️ **Safety first** — explicit warnings; image-quality gate prevents hallucinated diagnoses
- 🔒 **Production-grade security** — server-side Gemini key, validated payloads,
  rate limiting, CSP, generic error responses

---

## 🏗 Project structure

```
PROJECT/
├── src/                     React frontend (components, services, types)
│   ├── components/          LandingPage, CameraCapture, LoadingScreen,
│   │                        AnalysisDashboard, ChatInput, MessageBubble,
│   │                        SkeletonLoaders (lazy-chunk placeholders)
│   └── services/api.ts      Only network boundary (fetch to /api/*)
├── server/                  Express API (config, gemini, validation, index)
├── api/index.ts             Vercel serverless entry (re-exports Express app)
├── public/                  robots.txt, sitemap.xml, security.txt, favicon
│
├── AGENTS.md                AI assistant rules (style, model strings, security)
├── .mcp.json + opencode.json  Context7 + Graphify MCP (disabled by default)
├── .lighthouserc.json       Lighthouse CI config
├── vercel.json              Serverless function limits
│
├── PRD.md                   Product requirements
├── ARCHITECTURE.md          System design
├── RULES.md                 Contributor rules
├── PHASES.md                Roadmap & milestones
├── DESIGN.md                UI/UX system
├── MEMORY.md                Decisions & gotchas log
├── SECURITY.md              Security model
├── API.md                   HTTP API reference
├── DATABASE.md              Datastore decision (none in v1)
├── AI_RULES.md              Rules for AI-generated code
├── ERROR_HANDLING.md        Error strategy across layers
├── VALIDATION.md            Payload/input validation
├── TESTING.md               Testing guide
├── DEPENDENCIES.md          Dependency inventory & rules
├── DEPLOYMENT.md            Local / standalone / Vercel
├── ENVIRONMENT.md           Environment variables
├── PERFORMANCE.md           Performance targets & practices
├── ACCESSIBILITY.md         a11y standards
├── SEO.md                   Metadata & crawling assets
├── CHANGELOG.md             Version history
├── CONTRIBUTING.md          How to contribute
└── LICENSE                  MIT
```

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env        # add your GEMINI_API_KEY
npm run dev                 # web :3000 + API :3001
```

Open http://localhost:3000. Without a key, the API returns `503` securely.

### Commands

```bash
npm run dev            # web + API concurrently
npm run build          # typecheck + vite build + server bundle
npm start              # standalone: API + built frontend
npm test               # vitest (validation + API client)
npm run typecheck      # tsc --noEmit
npm run lighthouse     # Lighthouse CI audit (perf/a11y/SEO)
```

---

## 🏛 System architecture

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Motion + `react-markdown`
- **Backend:** Express 5 (helmet, CORS, `express-rate-limit`), Google
  `@google/genai` SDK
- **API boundary:** `src/services/api.ts` → `/api/analyze` · `/api/chat`
  → re-validated in `server/validation.ts`
- **Structured output:** Gemini `responseSchema` JSON mode returns the typed
  `RepairAnalysis` that the dashboard renders
- **Deployment:** runs standalone (`npm start`) or on Vercel (static assets +
  serverless API via `api/index.ts`)

See `ARCHITECTURE.md`, `API.md`, `VALIDATION.md`, and `SECURITY.md`.

---

## 🛠 AI-assist tooling wired into this repo

- 🔹 **Lighthouse** — `npm run lighthouse` audits performance/accessibility/SEO
  (`.lighthouserc.json`)
- 🔹 **Context7** — up-to-date library docs for AI models; MCP-configured,
  disabled by default (`.mcp.json`, `opencode.json`). Add a key at
  https://context7.com/dashboard.
- 🔹 **Graphify** — codebase knowledge graph for AI models; MCP-configured,
  disabled by default. Requires `pip install graphifyy`, `graphify build`.
- 🔹 **21st.dev** — shadcn-compatible component registry; pull only per the
  YAGNI checklist and never to bypass existing components.

`AGENTS.md` encodes repo-specific AI rules (emoji icons over SVG, preserve model
strings, no gradients, strict security), and `AI_RULES.md` expands them.

---

## 🏆 Google Live Agent Challenge alignment

- Multimodal interaction (vision + language)
- Real-time AI assistance
- Structured AI reasoning
- Practical real-world problem solving

---

## 🌍 Impact

RepairMate AI promotes self-repair, extends device lifespan, and reduces
unnecessary replacements — cutting global e-waste and lowering repair costs.

## 📜 License

MIT — see [LICENSE](LICENSE).