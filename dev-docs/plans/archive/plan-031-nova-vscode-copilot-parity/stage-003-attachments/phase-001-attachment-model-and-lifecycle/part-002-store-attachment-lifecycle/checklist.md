---
part: part-002-store-attachment-lifecycle
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

- [ ] Add attachment state to the Nova session store using Svelte 5 runes conventions.
- [ ] Support add, remove, clear-on-new-chat, and clear-on-send decision points.
- [ ] Default to per-conversation attachments cleared on new chat; do not persist across sessions.
- [ ] Add tests for dismiss and new-conversation clearing.

## Post-Implementation

- [ ] Attachments can be added and removed without mutating unrelated session state.
- [ ] New chat clears all attachments.
- [ ] Attachments are not persisted across projects or browser sessions unless a later plan changes that contract.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
