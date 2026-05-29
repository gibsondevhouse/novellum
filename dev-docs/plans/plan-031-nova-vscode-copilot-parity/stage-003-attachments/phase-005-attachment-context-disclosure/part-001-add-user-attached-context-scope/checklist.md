---
part: part-001-add-user-attached-context-scope
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

- [ ] Prepend user-attached context to the existing scoped context payload without replacing project baseline context.
- [ ] Keep attachment blocks labeled by source kind and label.
- [ ] Apply size/truncation accounting so attachment chips do not silently overload the prompt.
- [ ] Record attachment scope counts for disclosure.

## Post-Implementation

- [ ] Attached items are present in the model request context.
- [ ] Project baseline context remains included when a project is open.
- [ ] Attachment truncation, if any, is disclosed or logged in context metadata.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
