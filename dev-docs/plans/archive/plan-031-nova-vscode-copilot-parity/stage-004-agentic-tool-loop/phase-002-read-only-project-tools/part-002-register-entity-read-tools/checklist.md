---
part: part-002-register-entity-read-tools
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

- [ ] Define tools such as `read_scenes`, `read_characters`, `read_locations`, and `read_outline` or a single typed `read_project_entities` tool if that better matches existing code.
- [ ] Keep outputs compact and filterable by IDs from attachments or model-selected criteria.
- [ ] Return empty arrays with explanatory metadata, not thrown errors, for empty projects.
- [ ] Add tests for zero, one, and multiple entity results.

## Post-Implementation

- [ ] Agent mode can inspect core project entities through tool calls.
- [ ] No tool handler imports editor/manuscript mutation modules.
- [ ] Results are bounded and suitable for model context.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
