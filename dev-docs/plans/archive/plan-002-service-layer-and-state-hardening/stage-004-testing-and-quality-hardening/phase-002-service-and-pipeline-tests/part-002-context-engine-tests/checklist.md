---
part: part-002-context-engine-tests
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-repository-tests` is `complete`
- [ ] `context-engine.ts` fully implements all four policies (parts 002 and 003 of stage 003 are complete)

## Post-Implementation

- [ ] `context-engine.test.ts` created with all policy scenarios listed in `part.md`
- [ ] `seedProject()` helper exists in test file and is reused across all describe blocks
- [ ] Adjacent scene edge cases (first/last scene) tested
- [ ] Unknown policy error case tested
- [ ] `pnpm run test` passes with zero failures
- [ ] Coverage ≥80% for `context-engine.ts` — attach `evidence/coverage-context-engine-YYYY-MM-DD.txt`
