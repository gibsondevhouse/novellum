---
part: part-001-tests-quality
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All prior stages (001–003) complete
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] Brainstorm agent tests written (>90% coverage)
- [ ] Component tests written and passing
- [ ] Integration tests (if applicable) passing
- [ ] Documentation updated in AGENTS.md and dev-docs
- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm lint:css` passes with zero errors
- [ ] `pnpm test` passes with all tests, >90% coverage
- [ ] `pnpm check:tokens` passes with zero violations
- [ ] Manual QA complete: brainstorm → accept → worldbuild flow verified

## Post-Implementation

- [ ] Test coverage report saved to `evidence/`
- [ ] Quality gate results saved to `evidence/`
- [ ] Manual QA notes saved to `evidence/`
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Plan `status` updated to `complete` in `plan.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked for plan sign-off
