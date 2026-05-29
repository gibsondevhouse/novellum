---
part: part-002-render-tool-chips-and-agent-plan
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

- [ ] Render collapsible tool-call chips with label, status, and duration where available.
- [ ] Render tool-result summary without dumping full payload by default.
- [ ] Optionally render a collapsible `Plan` header in the first assistant message.
- [ ] Ensure proposal artifacts are visibly review-gated.

## Post-Implementation

- [ ] Users can see which tools ran and whether they succeeded.
- [ ] Tool payload details are collapsible and do not dominate the conversation.
- [ ] Proposal artifacts are clearly not auto-applied.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
