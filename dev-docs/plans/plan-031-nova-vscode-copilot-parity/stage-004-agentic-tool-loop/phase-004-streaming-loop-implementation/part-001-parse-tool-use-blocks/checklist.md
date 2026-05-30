---
part: part-001-parse-tool-use-blocks
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

- [ ] Identify OpenRouter-compatible tool-use response shape currently returned by the model route.
- [ ] Parse tool-use blocks only when mode is Agent and tools were advertised.
- [ ] Keep non-tool responses streaming normally.
- [ ] Add tests for text-only, one-tool, malformed-tool, and multiple-tool responses.

## Post-Implementation

- [ ] Ask and Write modes never enter tool parsing path.
- [ ] Agent mode can distinguish final text from tool-use requests.
- [ ] Malformed tool requests become visible errors rather than silent failure.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
