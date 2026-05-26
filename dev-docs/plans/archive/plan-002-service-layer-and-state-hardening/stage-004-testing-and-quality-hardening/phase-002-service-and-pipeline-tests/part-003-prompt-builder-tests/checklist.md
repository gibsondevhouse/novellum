---
part: part-003-prompt-builder-tests
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-002-context-engine-tests` is `complete`
- [ ] `prompt-builder.ts` and `task-resolver.ts` are fully implemented
- [ ] `AiTask` and `AiContext` fixture shapes confirmed from `types.ts`

## Post-Implementation

- [ ] `task-resolver.test.ts` created — all 4 scenarios pass
- [ ] `prompt-builder.test.ts` created — all 7 scenarios pass including truncation
- [ ] `pnpm run test` passes with zero failures
- [ ] Coverage ≥80% for both files — attach `evidence/coverage-prompt-builder-YYYY-MM-DD.txt`
- [ ] Full plan quality gate check run: `pnpm run lint && pnpm run check && pnpm run test:coverage` — all pass (attach combined output as `evidence/quality-gate-final-YYYY-MM-DD.txt`)
