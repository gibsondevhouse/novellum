---
part: part-001-define-per-mode-system-prompts
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

- [ ] Ask mode: conversational, no tool calls, grounded in project context.
- [ ] Write mode: structured proposal generation for outline, scene, and revision artifacts.
- [ ] Agent mode: multi-step planning and tools allowed only after Stage 004 loop is implemented.
- [ ] Encode no-auto-apply rule in Write and Agent prompts.

## Post-Implementation

- [ ] Each mode emits a distinct system prompt segment or resolver instruction.
- [ ] Ask mode never advertises tools.
- [ ] Write and Agent prompts explicitly require proposal envelopes for generated changes.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
