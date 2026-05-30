---
part: part-001-implement-autogrow-composer-input
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

- [ ] Set textarea min-height to the compact target of approximately 32px using tokens.
- [ ] Auto-grow up to approximately 144px and then allow internal scrolling.
- [ ] Preserve Enter-to-send and Shift+Enter newline behavior.
- [ ] Add or update tests for empty, one-line, multi-line, and disabled states.

## Post-Implementation

- [ ] Composer starts as a single-line input at 360px width.
- [ ] Composer grows only when content requires it and does not push controls off-screen.
- [ ] Keyboard send/newline behavior remains unchanged and tested.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
