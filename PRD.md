# PRD — RepairMate AI

**Product:** RepairMate AI — a multimodal DIY repair assistant powered by Google Gemini.
**Status:** Live / v1.0.0
**Deployed at:** https://repair-mate-seven.vercel.app

---

## 1. Problem Statement

Most people throw away broken devices because they don't know how to repair them.
Professional repair is expensive, and the knowledge is hard to access. This drives
e-waste and unnecessary replacements.

## 2. Product Summary

RepairMate AI is a web app that lets a user photograph (or upload) a broken device
and receive a structured, engineering-grade repair plan: identified device,
likely faults with confidence, tools needed, step-by-step repair protocol, safety
warnings, cost and time estimates, and sustainability impact. A context-aware
follow-up chat lets the user keep asking questions about the repair.

## 3. Goals

1. Enable a non-expert to safely repair common household devices.
2. Provide transparent reasoning (confidence scores, fault likelihoods).
3. Emphasize safety: warn before any dangerous repair and recommend professionals
   when appropriate.
4. Promote sustainability by reducing e-waste.

## 4. Non-Goals

- No on-device ML training; all intelligence is server-side via the Gemini API.
- No user accounts or persistence (stateless; see `DATABASE.md`).
- No marketplace or payments in v1.

## 5. Personas

- **DIY Homeowner** — knows basic tool usage, wants step-by-step guidance.
- **Curious Learner** — wants to understand how the device works and learn
  (learning section).
- **Sustainability-minded user** — wants e-waste/carbon savings estimates.

## 6. User Stories

| # | Story |
|---|-------|
| 1 | As a user, I can open my camera or upload a photo of a broken device. |
| 2 | As a user, I see a structured diagnosis (device, likely faults, difficulty, time, cost). |
| 3 | As a user, I read explicit safety warnings before starting. |
| 4 | As a user, I can follow repair steps and mark them complete. |
| 5 | As a user, I can ask follow-up questions in chat and attach extra images. |
| 6 | As a user, I can share or download the repair guide. |

## 7. Functional Requirements

- **FR1 Capture:** camera capture (environment facing) or file upload, drag & drop,
  and two curated demo images on the landing page. Images are downscaled client-side
  to ≤1024px JPEG (quality 0.8) before upload.
- **FR2 Analyze:** `POST /api/analyze` sends prompt + data-URL image; the Gemini model
  returns a strictly-typed `RepairAnalysis` JSON object.
- **FR3 Quality gate:** if `imageQuality.isClear === false`, the app shows a helpful
  "retake" screen instead of a fake diagnosis.
- **FR4 Dashboard:** renders the structured analysis (see `DESIGN.md`).
- **FR5 Chat:** `POST /api/chat` with conversation history; supports voice input
  (Web Speech API) and attaching additional images.
- **FR6 Accessibility/SEO:** semantic HTML, `robots.txt`, `sitemap.xml`,
  `security.txt`, Lighthouse-audited (see `ACCESSIBILITY.md`, `SEO.md`).

## 8. Non-Functional Requirements

- **Security:** defense-in-depth per `SECURITY.md` and `AGENTS.md`.
- **Performance:** lighthouse bundle < 550 KB (gzip ≈ 162 KB JS); image resize
  keeps payloads small.
- **Abuse resistance:** per-endpoint rate limiting (`RATE_LIMIT_*`).
- **Reliability:** graceful degradation (503s when Gemini is unconfigured/failed),
  structured error responses, no internal details leaked.
- **Observability:** request logging with `LOG_LEVEL`.

## 9. Data & Interfaces

No database. `RepairAnalysis` type is shared between `src/types.ts` (client) and
`server/gemini.ts` (mirror). API surface documented in `API.md`.

## 10. Success Metrics

- Lighthouse scores ≥ 90 (accessibility, best-practices, SEO).
- Analysis request success rate and p95 latency via server logs.
- Rate-limit violations near zero.

## 11. Out of Scope for v1 (roadmap)

- AR repair overlays, video diagnosis, IoT integration, parts marketplace,
  repair community knowledge base, multi-language support.