---
part: part-002-parser-tests
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Part-001 (Prompt Builder) is complete
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] Parser function implemented in `brainstorm-agent.ts`
- [ ] Test file created at `tests/ai/brainstorm-agent.test.ts`
- [ ] Valid output test cases passing
- [ ] Edge case tests (malformed JSON, missing fields, etc.) passing
- [ ] Parser coverage >90%
- [ ] `pnpm test` passes all tests
- [ ] `pnpm check` passes with zero errors

## Post-Implementation

- [ ] Test results and coverage saved to `evidence/`
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
