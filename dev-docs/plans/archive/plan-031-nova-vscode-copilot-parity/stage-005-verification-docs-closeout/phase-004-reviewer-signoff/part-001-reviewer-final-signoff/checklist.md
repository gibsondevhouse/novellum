---
part: part-001-reviewer-final-signoff
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

- [ ] Review all part checklists and evidence directories.
- [ ] Append reviewer signoff entries to relevant impl logs.
- [ ] Only after signoff, update statuses from review to complete.
- [ ] If blocked, leave status blocked and record exact remediation required.

## Post-Implementation

- [ ] No part is marked complete without reviewer signoff entry.
- [ ] Append-only logs remain append-only.
- [ ] Plan status reflects child status rollup accurately.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
