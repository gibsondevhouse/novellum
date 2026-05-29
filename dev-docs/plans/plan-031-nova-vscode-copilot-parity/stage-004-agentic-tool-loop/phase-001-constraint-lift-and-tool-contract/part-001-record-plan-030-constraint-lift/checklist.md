---
part: part-001-record-plan-030-constraint-lift
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

- [ ] Record that tools are Agent-mode only and opt-in per turn.
- [ ] Record that read tools are pure functions over existing repositories.
- [ ] Record that mutation-like tools return `ProposalEnvelope` and never auto-apply.
- [ ] Record iteration cap and abort path as required implementation guardrails.

## Post-Implementation

- [ ] Plan-031 explicitly states the constraint lift and guardrails.
- [ ] Plan-030 stages 002 and 003 are marked superseded by plan-031 without reopening stage 001.
- [ ] Tracker snippets are updated for ACTIVE-PLAN and MASTER-PLAN.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
