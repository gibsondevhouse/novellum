---
part: part-004-draft-lifecycle
last_updated: ~
---

# Implementation Checklist

## Pre-Implementation

- [ ] `AUTHOR_DRAFT_LIFECYCLE_VALUES` reviewed in `author-draft-contract.ts`
- [ ] Option A vs B decision made and documented in `part.md` if changed

## Implementation

- [ ] Option A: `createCheckpoint` sets `lifecycle: 'draft'`; generate route transitions to `review` on parse success
- [ ] — OR — Option B: `'draft'` removed from schema and all references updated
- [ ] Checkpoint service tests updated for chosen path

## Post-Implementation

- [ ] Lint passes
- [ ] Type-check passes
- [ ] Tests pass
- [ ] `impl.log.md` updated with chosen option and rationale
- [ ] Part `status` updated to `review`
