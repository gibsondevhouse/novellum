---
part: part-002-implement-task-state-machine
last_updated: 2026-06-15
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage moved through `in-progress` and are now `review`.
- [x] All declared dependencies are `complete` or explicitly waived.
- [x] `part.md` has been reviewed and accepted.
- [x] Current source files have been inspected; stale path assumptions are documented.
- [x] Dev environment is ready.

## Implementation

- [x] All files listed in `part.md > Files > Create` have been created or justified.
- [x] All files listed in `part.md > Files > Update` have been updated or justified.
- [x] Each acceptance criterion in `part.md` is satisfied.
- [x] Edge cases are addressed or explicitly deferred with severity and rationale.
- [x] Tests are added or updated for the behavior introduced by this part.

## Post-Implementation

- [x] `pnpm check` passes or unrelated pre-existing failure is documented.
- [x] `pnpm lint` passes or unrelated pre-existing failure is documented.
- [x] `pnpm lint:css` passes when UI/style files changed, or unrelated failure is documented.
- [x] Relevant `pnpm test ...` target passes.
- [x] `pnpm check:tokens` passes when UI/style files changed.
- [x] At least one artifact added to `evidence/`.
- [x] `impl.log.md` updated with final implementation entry.
- [x] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent evaluation pending; do not mark complete until sign-off is real.
