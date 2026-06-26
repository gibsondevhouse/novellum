---
part: part-001-prompt-builder
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage are `in-progress`
- [x] Part-001 (Define Schema) is implementation-complete and in `review`
- [x] Existing agent implementations reviewed
- [x] `part.md` has been reviewed and accepted
- [x] Dev environment is ready

## Implementation

- [x] `brainstorm-agent.ts` created in `src/lib/ai/`
- [x] Prompt builder function implemented
- [x] Follows ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT pattern
- [x] Sample prompts generated and validated
- [x] Wired to task resolver or prompt builder service
- [x] `pnpm check` passes with zero errors
- [x] `pnpm lint` passes with zero errors

## Post-Implementation

- [x] Sample prompt output saved to `evidence/`
- [x] At least one artifact added to `evidence/`
- [x] `impl.log.md` updated with final entry
- [x] Part `status` updated to `review` in `part.md` frontmatter
- [x] Reviewer notified / Reviewer Agent invoked
