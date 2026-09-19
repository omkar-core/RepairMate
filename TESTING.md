# TESTING.md

Vitest is the test runner. It covers **(a)** pure server validation and **(b)** the
client API client, without needing a live Gemini key.

## Commands

```bash
npm test            # run all suites once
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit (treated as the lint gate)
npm run lighthouse  # Lighthouse CI audit (performance/a11y/SEO)
```

Test include patterns: `server/**/*.test.ts`, `src/**/*.test.ts` (see
`vitest.config.ts`).

## Suites

### `server/validation.test.ts` (unit)

Covers the pure functions in `server/validation.ts`:

- `parseDataUrl` — valid parses, non-data URLs, malformed base64; documents that
  mime whitelisting is caller responsibility.
- `decodedByteLength` — padding-aware byte math.
- `validateAnalyzePayload` — valid payload, missing/oversized prompt, non-image
  mime (SVG), oversize image, missing `imageUrl`, non-object body, control-char
  stripping.
- `validateChatPayload` — message-only, image-only, empty message without image
  (rejected), oversized history, invalid roles, first-turn rule, alternating
  history, invalid parts, oversized message.

### `src/services/api.test.ts` (unit, network mocked)

Stubs `global.fetch` and verifies:

- `analyzeRepairIssueStructured` posts `{ prompt, imageUrl }` to `/api/analyze`
  and returns the parsed `RepairAnalysis`.
- API error bodies map to thrown `Error`s with the server message.
- Network failures throw a friendly "Network error…" message.
- Invalid (non-data-URL) images are rejected client-side.
- `chatWithRepairMate` posts `{ history, message }` to `/api/chat` and returns
  `{ text }`.

## What is not unit-tested

- Live Gemini calls (`server/gemini.ts`) — requires a real `GEMINI_API_KEY`;
  verified manually via `npm run dev` and the `/api/analyze` smoke path.
- React component rendering — no component test runner is installed (YAGNI).
  Components are covered by the Lighthouse audit + manual QA flows
  (see `PERFORMANCE.md` / `ACCESSIBILITY.md`).

## Adding a test

1. Put server tests next to the source: `server/<file>.test.ts`.
2. Put API-client tests next to the service: `src/services/<file>.test.ts`.
3. Import from `vitest` (`describe`, `it`, `expect`, `vi`).
4. Keep tests hermetic — stub `fetch`, never hit the network.

## CI

- `npm run build` runs `tsc --noEmit && vite build && tsup` — the type gate.
- `npm run lighthouse` runs the audit against `vite preview` (see
  `.lighthouserc.json`). Add this to CI before merging when enforcing scores
  (currently thresholds: a11y/best-practices/SEO ≥ 0.9 error, perf ≥ 0.7 warn).