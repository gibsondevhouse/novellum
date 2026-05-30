---
part: part-001-densify-message-bubbles-and-gaps
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

- [ ] Reduce inter-message gap toward 6px using tokens.
- [ ] Reduce bubble vertical padding toward 6px while preserving readable line-height.
- [ ] Ensure code blocks, lists, and proposal artifacts do not visually collapse.
- [ ] Verify scroll anchoring during streaming responses.

## Post-Implementation

- [ ] Message log shows materially more content above the fold at 360px width.
- [ ] Tool chips and proposal artifacts remain visually separate from plain prose.
- [ ] Streaming does not jitter or lose scroll position.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
