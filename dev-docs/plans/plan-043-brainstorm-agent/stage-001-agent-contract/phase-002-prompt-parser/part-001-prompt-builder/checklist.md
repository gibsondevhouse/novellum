---
part: part-001-prompt-builder
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Part-001 (Define Schema) is complete
- [ ] Existing agent implementations reviewed
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `brainstorm-agent.ts` created in `src/lib/ai/`
- [ ] Prompt builder function implemented
- [ ] Follows ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT pattern
- [ ] Sample prompts generated and validated
- [ ] Wired to task resolver or prompt builder service
- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors

## Post-Implementation

- [ ] Sample prompt output saved to `evidence/`
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
