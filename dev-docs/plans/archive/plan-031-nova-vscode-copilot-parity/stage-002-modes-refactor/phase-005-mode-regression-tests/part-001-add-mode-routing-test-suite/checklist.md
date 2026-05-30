---
part: part-001-add-mode-routing-test-suite
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

- [ ] Test Ask mode grounded chat path with no tools advertised.
- [ ] Test Write mode proposal route for outline/scene/revision requests.
- [ ] Test Agent mode guard or resolver handoff without executing tools yet.
- [ ] Test invalid persisted mode fallback to Ask.

## Post-Implementation

- [ ] Mode routing tests fail on old Chat/Scribe literals.
- [ ] Ask and Write paths remain deterministic.
- [ ] No test expects direct manuscript mutation.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
