---
part: part-001-structured-prompt-builder
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `phase-001-task-resolver-and-context-engine` is `complete` — `AiTask` and `AiContext` types are stable
- [ ] Read `dev-docs/prompt-system.md` §Template and §Output Contracts in full
- [ ] Read `dev-docs/ai-pipeline.md` §Prompt Builder section

## Post-Implementation

- [ ] `prompt-builder.ts` created with `buildPrompt` export
- [ ] Output string contains all 5 sections in correct order: ROLE, TASK, CONTEXT, CONSTRAINTS, OUTPUT FORMAT
- [ ] `MAX_PROMPT_CHARS = 8000` constant defined
- [ ] CONTEXT body is truncated (not errored) when limit is reached
- [ ] CONSTRAINTS_BY_TYPE map covers all 6 task types
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
