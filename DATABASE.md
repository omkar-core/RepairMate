# DATABASE.md

## Current state: no database

RepairMate AI v1 is **intentionally stateless**. There is no database, no ORM, no
migration system, and no schema files in this repository.

### Why (YAGNI)

- Every analysis and chat session lives entirely in client state
  (`analysis`, `messages`, `capturedImage` in `src/App.tsx`).
- No user accounts, save/load, or analytics persistence exist yet.
- Adding a database now would add attack surface (injection, least-privilege,
  backups) with no requirement to justify it.

### What this means

- **No connection URLs or credentials exist** — so there is nothing to leak.
  When the database phase lands, all connection strings stay server-side only via
  `server/config.ts` and platform secret managers (see `SECURITY.md` rule 1).
- Rate limiting is in-memory (`express-rate-limit`), which is correct for a
  stateless, per-function deployment.

## When a database becomes required

Phase 9 in `PHASES.md` (user accounts, saved histories) is the trigger. When that
happens, the following rules are mandatory (they also match `AGENTS.md` §2.4):

1. Use an ORM/query builder with **parameterized queries only**. Never concatenate
   user input into queries (no injection).
2. Validate every schema before writes (server-side, mirror of
   `server/validation.ts` philosophy).
3. Least-privilege database user; credentials server-side only; never commit.
4. Sanitize user-generated content before storage.
5. Add schema versioning/migrations that run as part of the deploy pipeline.

Until then: the "database" is a boundary you do not cross. Revisit this document
the moment persistence is added — `MEMORY.md` tracks this as an open decision.