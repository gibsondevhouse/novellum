---
part: part-002-build-scene-draft-context
last_updated: ~
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All declared dependencies are `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `tests/ai/pipeline/author-draft-context.test.ts` created
- [ ] In-memory SQLite fixture setup with schema-compatible seed data
- [ ] Test: `targetWordCount` computed by division of chapter targetLength / scene count
- [ ] Test: metadata key aliasing `quickIntent` vs `quick-intent` both resolve
- [ ] Test: `priorSceneSummary` picks correct prior scene (or null for first scene)
- [ ] Test: canon refs assembled correctly from scene associations
- [ ] Test: `unresolvedThreads` (skip or placeholder if part-002 not yet done)

## Post-Implementation

- [ ] Lint passes with zero errors
- [ ] Type-check passes with zero errors
- [ ] Tests pass
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
