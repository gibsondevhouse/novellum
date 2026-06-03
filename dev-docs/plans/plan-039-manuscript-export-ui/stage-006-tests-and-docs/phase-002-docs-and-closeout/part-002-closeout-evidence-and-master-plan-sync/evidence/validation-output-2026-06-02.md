# Validation Output — 2026-06-02

Commands run:

```text
pnpm run lint
-> pass

pnpm run check
-> pass: 0 errors, 11 pre-existing world-building warnings

pnpm run test
-> pass: 219 test files, 1615 tests

pnpm run check:tokens
-> pass: 345 files scanned, 0 violations

pnpm run build
-> pass after removing invalid runtime exports from src/routes/api/worldbuilding/scan/+server.ts
-> warnings: existing Svelte world-building warnings and Lightning CSS unknown @theme/@utility warnings

pnpm exec playwright test tests/e2e/manuscript-export.spec.ts
-> pass: 1 test

pnpm exec playwright test tests/e2e/project-lifecycle.spec.ts
-> pass: 1 test
```

Playwright setup note:

- `pnpm exec playwright install chromium` was required in this environment because the expected local Chromium binary was missing.
