# VALIDATION.md

Every user→API→AI boundary is validated twice: once on the client before sending,
and once authoritatively on the server. This document describes the server rules
in `server/validation.ts` (the source of truth) and the client mirror.

## 1. Server validation (`server/validation.ts`)

Pure, unit-tested functions. No side effects; safe to reason about in isolation.

### Data URLs

```ts
parseDataUrl(dataUrl): { mimeType, base64 } | null
```

- Must match `/^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/`.
- Rejects non-data URLs, empty strings, and bodies larger than 12 MB (string cap).
- **Mime filtering is a caller's job** — `parseDataUrl` parses any mime; the
  endpoints whitelist image types.

### Mime & size whitelist

```ts
ALLOWED_IMAGE_MIME = { image/jpeg, image/png, image/webp, image/gif, image/avif }
```

- `decodedByteLength(base64)` computes the real decoded bytes (padding-aware).
- `isValidDataImage` = parses + mime whitelisted + decoded bytes ≤ `maxImageBytes`
  (default 5 MB, `MAX_IMAGE_BYTES`).

### Text caps

| Field | Limit |
|-------|-------|
| `prompt` (analyze) | ≤ 2000 chars |
| `message` (chat) | ≤ 4000 chars |
| `history` turns | ≤ 40 turns; first turn must be role `user` |
| `parts[i].text` | ≤ 2000 chars |
| `parts[i].inlineData` | mime + base64 strings required |

- `cleanText` strips ASCII control chars (`\u0000-\u0008` etc.) from every
  user-provided string.

### `validateAnalyzePayload(input, maxImageBytes)`

- Body must be a JSON object; `prompt` required, non-empty, capped.
- `imageUrl` required and must be a valid, whitelisted data URL within the byte cap.
- Returns sanitized `{ prompt, imageUrl, mimeType, base64 }` on success.

### `validateChatPayload(input, maxImageBytes)`

- Body must be an object with **at least one of** a non-empty `message` or a valid
  `imageUrl` (image-only chats are allowed, empty message without image is not).
- Message capped; image validated like analyze.
- `history` validated turn-by-turn (roles, parts shape, inline data shape), with
  per-part text truncation after sanitization.

## 2. Client-side mirror (`src/services/`)

- `normalizeDataUrl` — refuses non-`data:` URLs before any network call.
- Images are resized client-side to ≤1024px JPEG (q 0.8), so uploads are small and
  predictable.
- Chat turns build `parts` with either text or `inlineData` only for attached
  images (mime + base64 extracted from the data URL).

## 3. Guarantees

1. No route accepts unvalidated user input.
2. Mime + byte caps prevent executable/file-type upload abuse.
3. Turn and text caps bound prompt-engineering and token abuse.
4. Sanitization is applied before data touches the Gemini SDK.
5. Control characters are never forwarded upstream.

## 4. Tests

`server/validation.test.ts` (26 assertions covering parsing, byte length, mime
rejection, oversize payloads, roles, parts, first-turn rule, control-char
stripping). Keep in sync with any cap or rule change.