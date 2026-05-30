---
part: part-001-add-agentic-loop-tests
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

- [ ] Mock model responses for one-tool, multi-tool, no-tool, malformed-tool, and cap-exhaustion cases.
- [ ] Assert tool calls dispatch through the router and return final answer plus proposal artifacts where expected.
- [ ] Assert Ask and Write routes do not advertise or execute tools.

## Post-Implementation

- [ ] Agentic loop tests run without network access.
- [ ] All loop terminal states are covered.
- [ ] Tests prove no tool execution path exists outside Agent mode.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
