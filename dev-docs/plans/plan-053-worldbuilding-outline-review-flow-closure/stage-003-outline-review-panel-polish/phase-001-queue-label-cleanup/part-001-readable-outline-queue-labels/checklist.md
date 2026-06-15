---
part: part-001-readable-outline-queue-labels
last_updated: 2026-06-15
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`.
- [ ] All declared dependencies are `complete` or explicitly waived.
- [ ] `part.md` has been reviewed and accepted.
- [ ] Current source files have been inspected; stale path assumptions are documented.
- [ ] Dev environment is ready.

## Implementation

- [ ] All files listed in `part.md > Files > Create` have been created or justified.
- [ ] All files listed in `part.md > Files > Update` have been updated or justified.
- [ ] Each acceptance criterion in `part.md` is satisfied.
- [ ] Edge cases are addressed or explicitly deferred with severity and rationale.
- [ ] Tests are added or updated for the behavior introduced by this part.

## Post-Implementation

- [ ] `pnpm check` passes or unrelated pre-existing failure is documented.
- [ ] `pnpm lint` passes or unrelated pre-existing failure is documented.
- [ ] `pnpm lint:css` passes when UI/style files changed, or unrelated failure is documented.
- [ ] Relevant `pnpm test ...` target passes.
- [ ] Relevant Playwright/E2E coverage passes when product flows changed.
- [ ] `pnpm check:tokens` passes when UI/style files changed.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent evaluation pending; do not mark complete until sign-off is real.
