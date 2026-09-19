# ERROR_HANDLING.md

Error handling strategy across stack boundaries. Clients see generic, actionable
messages; detailed causes stay in server logs.

## 1. Conventions

- Every response carries `{ status }` appropriately; errors are always
  `{ error: { message: "..." } }` with a non-2xx status.
- Never leak stack traces, internal paths, SDK internals, or config values to
  clients.
- Server logs use `[ISO timestamp]` prefixes and include status + duration.

## 2. Client-side (React)

| Scenario | Handling |
|----------|----------|
| Network failure | `fetch` throws → `api.ts` converts to "Network error. Please check your connection and try again." |
| 4xx/5xx | `api.ts` reads `{ error: { message } }` and throws it; bubble shows the message. |
| Invalid image data | `normalizeDataUrl` throws "Invalid image data…" before any request. |
| Image not clear | `App.tsx` checks `result.imageQuality.isClear === false` → dedicated error screen with `issue` + `feedbackMessage`, offering Retake Photo / Cancel. |
| Analysis failed | `App.tsx` catch → error screen with `error.message`. |
| Chat failed | Assistant message with `⚠️ **Error:** …` rendered in the thread; input stays usable. |
| Camera denied | `CameraCapture` shows an inline error panel with a Retry button. |
| Share unsupported | Falls back to clipboard copy with a toast. |

## 3. Server-side (Express)

Error flow in `server/index.ts`:

1. Route handlers resolve validation (`validateAnalyzePayload` /
   `validateChatPayload`) → `400` with the exact reason.
2. Unconfigured Gemini (`isGeminiConfigured()` false) → `503`.
3. AI failures/faults during a call:
   - `GeminiUnavailableError` → `503` "AI service temporarily unavailable".
   - `entity.too.large` → `413` "Payload too large…".
   - `entity.parse.failed` / `SyntaxError` → `400` "invalid JSON".
4. Anything else → next(error) → final handler: derives status from
   `err.statusCode` when sane, otherwise `500`, logs `err.stack`, returns generic
   "An unexpected error occurred".
5. Unknown routes after static/SPA handling → `404` "Endpoint not found."

## 4. Client API error mapping (`src/services/api.ts`)

```text
fetch throws ──► "Network error…"
!response.ok ──► parse { error.message } ──► throw message (or status text)
response.ok  ──► return parsed JSON (throws "unexpected format" if undecodable)
```

## 5. Logging (observability)

- Request logger logs `method originalUrl status durationMs ip` on every request
  when `LOG_LEVEL=info`, else only 4xx/5xx.
- Unhandled errors: `console.error("[ISO] UNHANDLED", stack)`.
- Startup prints `(...)` env and warns when `GEMINI_API_KEY` is missing.

## 6. Testing errors

`server/validation.test.ts` and `src/services/api.test.ts` cover the validation
and client-mapping paths (e.g., server messages reach thrown errors; oversized
prompts; non-image mime; too-large instances). Keep these green when touching
error paths.