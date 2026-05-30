---
part: part-002-consolidate-footer-and-panel-body-spacing
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

- [ ] Reduce body padding toward the target `--space-3` density.
- [ ] Replace verbose footer copy with a low-contrast one-line status bar.
- [ ] Keep critical warnings visible; do not demote missing-key or no-project errors into decorative copy.
- [ ] Validate scroll behavior with an empty conversation and a long conversation.

## Post-Implementation

- [ ] Footer consumes minimal vertical space while still communicating status.
- [ ] Message log has more usable vertical space at constrained widths.
- [ ] Empty, loading, error, and grounded states remain distinguishable.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
