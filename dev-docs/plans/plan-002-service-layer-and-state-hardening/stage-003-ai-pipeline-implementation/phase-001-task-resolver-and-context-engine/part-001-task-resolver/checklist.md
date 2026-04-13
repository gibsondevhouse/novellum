---
part: part-001-task-resolver
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/ai-pipeline.md` in full — understand Task Resolver stage inputs and outputs
- [ ] Read `dev-docs/agents-map.md` — understand BrainstormAgent, OutlineAgent, DraftAgent roles
- [ ] Confirm `src/lib/ai/` directory does not already have conflicting files

## Post-Implementation

- [ ] `src/lib/ai/types.ts` created with all interfaces and type aliases listed in `part.md`
- [ ] `src/lib/ai/task-resolver.ts` created with `resolveTask` export
- [ ] All 6 named actions handled with correct mapping (verify against table in `part.md`)
- [ ] Default case returns `draft` task type
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
