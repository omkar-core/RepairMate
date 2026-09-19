# API.md — HTTP API Reference

Base URL: `/api` (same-origin in production; `http://localhost:3001/api` in dev).

All endpoints expect and return JSON. Errors use the shape:

```json
{ "error": { "message": "Human-readable reason" } }
```

Status codes: `400` validation, `413` payload too large, `429` rate limited,
`503` AI unavailable/not configured, `500` unexpected, `404` unknown endpoint.

---

## Health check

### `GET /api/health`

```json
{ "status": "ok", "geminiConfigured": true }
```

Used for uptime monitoring and to confirm the Gemini key is wired server-side.

---

## Analyze an image

### `POST /api/analyze`

Body (strict):

```json
{
  "prompt": "Your diagnostic prompt (≤ 2000 chars, required)",
  "imageUrl": "data:image/jpeg;base64,... (≤ 5 MB decoded, whitelisted mime)"
}
```

Response: the full `RepairAnalysis` object —

```json
{
  "imageQuality": { "isClear": true, "issue": null, "feedbackMessage": null },
  "deviceIdentification": { "name": "Ceiling Fan", "category": "Electrical Appliance", "brand": "Unknown", "type": "AC Motor Fan" },
  "componentsDetected": ["motor", "capacitor", "winding"],
  "possibleIssues": [{ "issue": "Loose wire at terminal", "likelihood": 70 }],
  "faultLocationDescription": "Near the power terminal block",
  "difficulty": "Easy",
  "estimatedTime": "5 minutes",
  "toolsNeeded": ["Phillips #0 screwdriver", "insulation tape"],
  "repairSteps": ["Turn off power", "Remove fan cover"],
  "safetyWarnings": ["Disconnect mains power before touching wiring"],
  "testRepair": ["Restore power and verify rotation"],
  "confidenceScore": 85,
  "alternativeSolutions": ["Replace capacitor"],
  "professionalRecommendation": ["Call a technician for motor rewind"],
  "estimatedCost": "$5 - $15",
  "sustainabilityImpact": { "eWasteSaved": "1 kg", "carbonSaved": "2 kg" },
  "learningSection": "Capacitors store charge to start single-phase motors."
}
```

Notes:

- When the image is too blurry/dark/unidentifiable, Gemini returns
  `imageQuality.isClear: false` with an `issue` + `feedbackMessage` and placeholder
  values for the rest; the client shows a retake screen.
- Rate limited: 8 req/min.

---

## Follow-up chat

### `POST /api/chat`

Body (strict):

```json
{
  "message": "Question or empty string when image-only (≤ 4000 chars)",
  "imageUrl": "optional data URL (same rules as /api/analyze)",
  "history": [
    { "role": "user", "parts": [{ "text": "..." }] },
    { "role": "model", "parts": [{ "text": "..." }] }
  ]
}
```

- `history` is optional, ≤ 40 turns, must start with role `user`.
- A part may be `{ "text": "..." }` and/or
  `{ "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }`.
- At least one of `message` (non-empty) or `imageUrl` is required.

Response:

```json
{ "text": "Markdown answer from RepairMate AI." }
```

Rate limited: 30 req/min.

---

## Client wiring (`src/services/api.ts`)

- Base: `VITE_API_BASE_URL || '/api'`.
- `analyzeRepairIssueStructured(prompt, imageSrc)` → strict `RepairAnalysis`.
- `chatWithRepairMate(history, message, image?)` → `{ text }`.
- Validates data URLs client-side (`normalizeDataUrl`) before posting;
  marshals 4xx/5xx error bodies into thrown `Error`s with the server message.
- Network failures become friendly user-facing errors.

## Versioning & compatibility

- This is the complete v1 surface. Extending the schema requires keeping
  `src/types.ts` and `server/gemini.ts` in sync and adding a test.