---
part: part-001-diagnostics-and-closeout
last_updated: 2026-06-11
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All previous stages are complete or explicitly accepted as stable
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] All files listed in `part.md > Files > Create` have been created
- [ ] All files listed in `part.md > Files > Update` have been updated
- [ ] Each acceptance criterion in `part.md` is satisfied
- [ ] Edge cases addressed

## Post-Implementation

- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm lint:css` passes with zero errors
- [ ] `pnpm test` passes
- [ ] `pnpm check:tokens` passes
- [ ] Targeted Playwright flows pass
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
