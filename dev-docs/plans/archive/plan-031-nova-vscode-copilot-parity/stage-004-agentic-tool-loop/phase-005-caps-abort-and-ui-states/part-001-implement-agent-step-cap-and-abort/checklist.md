---
part: part-001-implement-agent-step-cap-and-abort
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

- [ ] Set Agent loop max steps to 8 unless existing config indicates a lower safe default.
- [ ] Wire composer stop/abort action to the active Agent loop AbortController.
- [ ] Return a visible max-step-exhausted state instead of infinite recursion.
- [ ] Add tests for abort before tool result and cap exhaustion.

## Post-Implementation

- [ ] Agent loop cannot exceed configured max steps.
- [ ] User can abort mid-loop and the UI reflects aborted state.
- [ ] Abort does not leave composer permanently disabled.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
