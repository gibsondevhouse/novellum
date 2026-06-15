---
part: part-001-checkpoint-card-contract
last_updated: ~
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All declared dependencies are `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `tests/nova/checkpoint-card.contract.test.ts` created
- [ ] Contract 1: explicit confirmation before accept when content exists
- [ ] Contract 2: no forbidden editor-store imports in component source
- [ ] Contract 3: `dispatchSceneContentApplied` fires after successful accept
- [ ] Contract 4: stale-target response triggers force-overwrite dialog

## Post-Implementation

- [ ] Lint passes with zero errors
- [ ] Type-check passes with zero errors
- [ ] Tests pass
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
