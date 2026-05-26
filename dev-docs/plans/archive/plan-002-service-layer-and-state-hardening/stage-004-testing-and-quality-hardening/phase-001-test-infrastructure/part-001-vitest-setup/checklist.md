---
part: part-001-vitest-setup
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `stage-003-ai-pipeline-implementation` is `complete`
- [ ] Check if `vitest` is already in `package.json` devDependencies (it should not be from Path 1)
- [ ] Check if `vite.config.ts` exists and whether creating a separate `vitest.config.ts` conflicts with it

## Post-Implementation

- [ ] `vitest`, `@vitest/coverage-v8`, `jsdom`, `fake-indexeddb` present in `package.json` devDependencies
- [ ] `vitest.config.ts` created at repo root
- [ ] `src/test-setup.ts` created with `fake-indexeddb/auto` import
- [ ] `"test"`, `"test:watch"`, `"test:coverage"` scripts added to `package.json`
- [ ] `pnpm run test` output shows smoke test passing (attach as evidence: `evidence/vitest-smoke-test-YYYY-MM-DD.txt`)
- [ ] `pnpm run check` exits clean
