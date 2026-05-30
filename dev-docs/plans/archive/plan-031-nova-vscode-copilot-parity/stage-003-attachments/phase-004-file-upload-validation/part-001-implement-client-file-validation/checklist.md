---
part: part-001-implement-client-file-validation
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

- [ ] Limit file picker accept types to `.md,.txt`.
- [ ] Reject files over 100KB before reading content.
- [ ] Read valid files as text only and store parsed content in attachment payload.
- [ ] Show actionable rejection messages for type, size, and read errors.

## Post-Implementation

- [ ] Only `.md` and `.txt` can be attached from the UI.
- [ ] Files larger than 100KB are rejected before being added as chips.
- [ ] Binary or unreadable files do not enter Nova state.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
