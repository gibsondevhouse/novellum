---
part: part-001-baseline-snapshots
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Playwright test environment operational
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] Playwright visual tests executed
- [ ] All snapshot diffs identified and reviewed
- [ ] Each diff categorized (intentional / known-issue / stale)
- [ ] Snapshots updated for "good" diffs
- [ ] Known issues documented with context and screenshots

## Post-Implementation

- [ ] Snapshot inventory and known issues saved to `evidence/`
- [ ] Playwright visual suite runs without stale-baseline errors
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
