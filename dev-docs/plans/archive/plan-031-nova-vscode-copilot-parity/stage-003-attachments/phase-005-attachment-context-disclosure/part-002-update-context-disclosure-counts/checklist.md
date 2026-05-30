---
part: part-002-update-context-disclosure-counts
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

- [ ] Add `user-attached` scope count to disclosure metadata.
- [ ] Render clear copy such as `2 attached` without implying RAG ingestion.
- [ ] Test zero, one, and multiple attachment disclosure states.

## Post-Implementation

- [ ] Disclosure accurately reports attached item count.
- [ ] Attached count is separate from project-derived context count.
- [ ] New chat clears disclosure attachment count.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
