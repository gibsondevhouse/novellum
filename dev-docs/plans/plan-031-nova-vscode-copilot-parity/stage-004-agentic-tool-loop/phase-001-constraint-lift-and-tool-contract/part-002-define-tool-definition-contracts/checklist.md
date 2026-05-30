---
part: part-002-define-tool-definition-contracts
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

- [ ] Review existing `ToolDefinition` shape and avoid API invention where it already exists.
- [ ] Define read-tool result envelope and proposal-tool result envelope.
- [ ] Add explicit error envelope for tool failures.
- [ ] Ensure contracts can be rendered by tool chips without exposing raw internals.

## Post-Implementation

- [ ] Tool registry entries have schemas, labels, risk level, and renderer metadata where supported.
- [ ] Tool results can be appended back to the model as `tool_result` messages.
- [ ] Proposal tools cannot represent an applied mutation.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
