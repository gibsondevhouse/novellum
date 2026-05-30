---
part: part-002-normalize-missing-density-tokens
last_updated: 2026-05-28
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage are `in-progress`.
- [x] All declared dependencies are `complete` or intentionally waived.
- [x] `part.md` has been reviewed and accepted.
- [x] Dev environment is ready.
- [x] Stop conditions from `agent-handoff.md` have been reviewed.

## Implementation

- [x] Audit Nova component styles for direct pixel values and undefined token references.
- [x] Add or correct compact tokens, including `--size-dot-small` and any required replacement for undefined `--space-7`.
- [x] Keep values semantically named and reusable; do not create Nova-only one-off tokens unless no shared semantic exists.
- [x] Run token validation and record output.

## Post-Implementation

- [x] `pnpm check:tokens` passes.
- [x] Nova compact layout can reference tokens instead of hard-coded pixel values.
- [x] No brand colors or global palette decisions are changed.
- [x] Relevant lint/type/test command has been run or waiver recorded.
- [x] At least one artifact added to `evidence/`.
- [x] `impl.log.md` updated with final implementation entry.
- [x] Part `status` updated to `review` in `part.md` frontmatter.
- [x] Reviewer Agent notified.
