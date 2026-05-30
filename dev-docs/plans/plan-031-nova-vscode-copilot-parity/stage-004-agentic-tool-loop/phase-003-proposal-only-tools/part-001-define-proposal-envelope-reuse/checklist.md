---
part: part-001-define-proposal-envelope-reuse
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

- [ ] Inspect `PipelineArtifactEnvelope` and define the minimal `ProposalEnvelope` compatibility layer if needed.
- [ ] Include proposal type, source context, generated content, confidence/limitations, and explicit apply requirements.
- [ ] Avoid adding any field that implies automatic persistence.

## Post-Implementation

- [ ] Proposal payloads are machine-readable and UI-renderable.
- [ ] Proposal contract explicitly separates generated content from persisted state.
- [ ] Existing pipeline contracts are reused where feasible instead of duplicated.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
