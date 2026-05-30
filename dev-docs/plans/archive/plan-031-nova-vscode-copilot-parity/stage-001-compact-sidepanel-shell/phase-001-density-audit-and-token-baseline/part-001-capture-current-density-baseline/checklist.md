---
part: part-001-capture-current-density-baseline
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

- [x] Run the existing Nova visual specs or capture manual screenshots at 280px, 360px, and 520px panel widths.
- [x] Record current textarea min-height, send button size, panel padding, bubble padding, footer density, and greeting-card height.
- [x] Document visual defects as measurements, not subjective style notes.

## Post-Implementation

- [x] Evidence includes at least one constrained-width screenshot or Playwright artifact.
- [x] Baseline notes identify all concrete density deltas used by later parts.
- [x] No production files are changed in this part unless required to enable the baseline run.
- [x] Relevant lint/type/test command has been run or waiver recorded.
- [x] At least one artifact added to `evidence/`.
- [x] `impl.log.md` updated with final implementation entry.
- [x] Part `status` updated to `review` in `part.md` frontmatter.
- [x] Reviewer Agent notified.
