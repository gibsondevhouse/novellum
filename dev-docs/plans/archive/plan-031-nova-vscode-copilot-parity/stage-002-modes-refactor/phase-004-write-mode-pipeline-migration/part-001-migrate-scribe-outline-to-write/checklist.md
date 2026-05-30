---
part: part-001-migrate-scribe-outline-to-write
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

- [ ] Identify the current Scribe outline trigger and output path.
- [ ] Replace regex-driven Scribe dispatch with Write-mode outline intent routing.
- [ ] Wrap generated output as a proposal artifact, not an applied outline mutation.
- [ ] Add tests for outline proposal generation from project logline/synopsis.

## Post-Implementation

- [ ] Existing outline-generation capability remains reachable through Write mode.
- [ ] Generated outline output is clearly marked as a proposal.
- [ ] No generated outline is auto-applied to Project Hub, manuscript, or outline state.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
