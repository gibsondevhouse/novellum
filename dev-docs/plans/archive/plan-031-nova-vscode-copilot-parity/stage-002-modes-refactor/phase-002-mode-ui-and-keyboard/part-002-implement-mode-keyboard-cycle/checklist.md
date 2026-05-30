---
part: part-002-implement-mode-keyboard-cycle
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

- [ ] Add keyboard handler for `Cmd+.` / platform equivalent cycle order Ask → Write → Agent → Ask.
- [ ] Prevent conflict with IME, browser shortcuts, or focused popover controls.
- [ ] Announce mode change with accessible live text or visible hint.

## Post-Implementation

- [ ] Keyboard shortcut cycles modes in the expected order.
- [ ] Shortcut does not insert stray characters into composer input.
- [ ] Mode change is test-covered and does not submit the message.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
