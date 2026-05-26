---
part: part-002-model-router
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-structured-prompt-builder` is `complete`
- [ ] Confirm `TaskType` is exported from `src/lib/ai/types.ts`

## Post-Implementation

- [ ] `model-router.ts` created with `DEFAULT_MODEL_ROUTING_TABLE` and `routeModel` exports
- [ ] All 6 task types present in routing table
- [ ] `routeModel` falls back to `'default'` key when task type not found
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
