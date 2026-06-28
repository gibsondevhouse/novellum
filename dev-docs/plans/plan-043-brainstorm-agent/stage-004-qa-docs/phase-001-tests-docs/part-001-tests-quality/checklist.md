---
part: part-001-tests-quality
last_updated: 2026-06-28
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage were opened for implementation
- [x] All prior stages (001-003) are implementation-complete and in `review`
- [x] `part.md` has been reviewed and accepted
- [x] Dev environment is ready

## Implementation

- [x] Brainstorm agent tests written (>90% coverage)
- [x] Component tests written and passing
- [x] Integration tests passing
- [x] Documentation updated in AGENTS.md and dev-docs
- [x] `pnpm check` passes with zero errors
- [x] `pnpm lint` passes with zero errors
- [x] `pnpm lint:css` passes with zero errors
- [x] `pnpm test` passes with all tests, >90% coverage for the new agent code
- [x] `pnpm check:tokens` passes with zero violations
- [x] Browser QA complete: brainstorm → accept → worldbuild flow verified

## Post-Implementation

- [x] Test coverage report saved to `evidence/`
- [x] Quality gate results saved to `evidence/`
- [x] Browser QA notes saved to `evidence/`
- [x] At least one artifact added to `evidence/`
- [x] `impl.log.md` updated with final entry
- [x] Part `status` updated to `review` in `part.md` frontmatter
- [x] Plan `status` updated to `review` in `plan.md` frontmatter
- [x] Reviewer notified / queued via `ACTIVE-PLAN.md` pending review status
