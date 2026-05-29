---
part: part-001-run-and-record-compact-shell-visuals
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

- [ ] Run targeted Nova visual tests at the compact shell milestone.
- [ ] Rebaseline only intentional compact shell differences.
- [ ] Record command output and screenshot paths in evidence.
- [ ] Flag any unrelated visual churn as a blocker before Stage 002 starts.

## Post-Implementation

- [ ] Visual baselines reflect intentional compact shell changes only.
- [ ] Evidence records test command, result summary, and any baseline update rationale.
- [ ] Stage 001 can be treated as visually locked for later behavior work.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
