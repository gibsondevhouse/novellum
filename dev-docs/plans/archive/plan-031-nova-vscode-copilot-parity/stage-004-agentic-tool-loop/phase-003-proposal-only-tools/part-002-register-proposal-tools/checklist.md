---
part: part-002-register-proposal-tools
last_updated: 2026-05-28
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`.
- [ ] All declared dependencies are `complete` or intentionally waived.
- [ ] `part.md` has been reviewed and accepted.
- [ ] Dev environment is ready.
- [ ] Stop conditions from `agent-handoff.md` have been reviewed.

## Implementation

- [ ] Implement proposal tools so they return proposal envelopes only.
- [ ] Require explicit source context and missing-input reporting.
- [ ] Ensure handlers cannot write to manuscript/editor/project repositories.
- [ ] Add tests that proposal tools produce proposal artifacts from grounded context.

## Post-Implementation

- [ ] All three proposal tools are registered and callable by Agent mode.
- [ ] No proposal tool mutates persisted project state.
- [ ] Generated proposals include enough metadata for user review.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
