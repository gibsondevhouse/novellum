# Testing

> Last verified: 2026-05-07

Three tiers. All three should pass before a release.

## Vitest (unit + integration)

```bash
pnpm test            # run all
pnpm test:watch      # watch mode
pnpm test:coverage   # with coverage
```

Tests live under [../../tests/](../../tests/) by area (ai/, editor/, nova/, settings/, sqlite/, repositories/, …). Setup: [../../tests/setup.ts](../../tests/setup.ts). Mocks: [../../tests/__mocks__/](../../tests/__mocks__/).

## Playwright E2E

```bash
pnpm test:e2e
```

Suite at [../../tests/e2e/](../../tests/e2e/). Covers cross-route flows.

## Visual regression

```bash
pnpm test:visual
```

Suite at [../../tests/visual/](../../tests/visual/). Snapshots are committed. Intentional updates require a justification in the PR body.

## Adding tests

| If you… | Add… |
| --- | --- |
| Add an AI agent | `tests/ai/<agent>.test.ts` covering happy path + at least one malformed response. |
| Add a module service | `tests/<module>/<service>.test.ts`. |
| Add a `/api/*` endpoint | `tests/routes/` or `tests/sqlite/` for persistence. |
| Add a schema migration | `tests/db/` or `tests/sqlite/` regression. |
| Touch a critical surface | Visual snapshot in `tests/visual/`. |

## Boundary tests

The ESLint config is itself the boundary test. Run `pnpm lint`. Don't silence boundary errors — fix the import.

## Deeper reference

[../../dev-docs/05-workflow/testing.md](../../dev-docs/05-workflow/testing.md) — full per-area breakdown.
