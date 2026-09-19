# Contributing

Thanks for helping improve RepairMate AI. Keep it small, safe, and tested.

## Getting started

1. Fork the repo, clone it, and run `npm install`.
2. Copy `.env.example` → `.env` and add your `GEMINI_API_KEY`.
3. Run `npm run dev` (Vite :3000 + API :3001).

## Branch & commit conventions

- Work on a feature branch (e.g. `feat/camera-torch`,
  `fix/rate-limit-headers`).
- Commit messages follow the repo style — imperative, conventional prefix:
  `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
- Match the existing formatting; keep diffs focused.

## Before submitting

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (and add tests for the change)
- [ ] `npm run build` passes
- [ ] `npm run lighthouse` meets thresholds (or note the variance)
- [ ] No secrets in the diff (search for `GEMINI_API_KEY=` and `.env`)
- [ ] Docs kept in sync: `API.md` when endpoints change, `CHANGELOG.md` for
      notable changes, `MEMORY.md` when you learn a gotcha.

## Code guidelines

- Follow `AGENTS.md` + `RULES.md` (emojis over SVG icons, no gradients, never
  change model strings).
- Keep both `RepairAnalysis` copies in sync (`src/types.ts`,
  `server/gemini.ts`).
- New endpoints: add a rate limiter + validation + a test.
- YAGNI first: reuse existing components and utilities before adding deps.

## Security

- Report vulnerabilities to the contact in `public/.well-known/security.txt`.
- Never commit credentials, `.env`, or secrets of any kind.
- If you find a potential issue in deployed dependencies, file an issue first;
  don't `npm audit fix --force`.

## Code of conduct

Be constructive, assume good intent, and keep security-sensitive topics in
private disclosure channels.