---
part: part-001-implement-existing-outline-conflict-preflight
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage are `in-progress`.
- [x] All declared dependencies are `complete` or explicitly waived by the planner/reviewer.
- [x] `part.md` has been reviewed and accepted.
- [x] Current source files have been inspected; stale path assumptions are documented.
- [x] Dev environment is ready.

## Implementation

- [x] All files listed in `part.md > Files > Create` have been created or a justified alternative path is logged.
- [x] All files listed in `part.md > Files > Update` have been updated or a justified alternative path is logged.
- [x] Each acceptance criterion in `part.md` is satisfied.
- [x] Edge cases are addressed or explicitly deferred with severity and rationale.
- [x] Tests are added/updated for the behavior introduced by this part.

## Post-Implementation

- [x] `pnpm check` passes or unrelated pre-existing failure is documented.
- [x] `pnpm lint` passes or unrelated pre-existing failure is documented.
- [x] `pnpm lint:css` passes when UI/style files changed, or unrelated pre-existing failure is documented.
- [x] Relevant `pnpm test ...` target passes.
- [x] `pnpm check:tokens` passes when UI/style files changed.
- [x] At least one artifact added to `evidence/`.
- [x] `impl.log.md` updated with final implementation entry.
- [x] Part `status` updated to `review` in `part.md` frontmatter.
- [x] Reviewer notified / Reviewer Agent invoked.
