---
part: part-002-dispatch-and-feed-tool-results
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

- [ ] Dispatch tool calls through `tool-router.ts` only; do not inline handlers in chat service.
- [ ] Append structured `tool_result` messages to the conversation context.
- [ ] Continue streaming until a final assistant response arrives or the cap is reached.
- [ ] Record tool call and result metadata for UI chips.

## Post-Implementation

- [ ] A one-tool Agent request completes with tool call, tool result, and final assistant answer.
- [ ] Router errors return tool-result error envelopes the model can recover from.
- [ ] Conversation transcript remains deterministic enough for tests.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
