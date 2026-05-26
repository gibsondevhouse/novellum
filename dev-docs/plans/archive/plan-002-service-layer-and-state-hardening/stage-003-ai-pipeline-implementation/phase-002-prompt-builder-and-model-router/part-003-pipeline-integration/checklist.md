---
part: part-003-pipeline-integration
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-structured-prompt-builder` and `part-002-model-router` are `complete`
- [ ] Read current `src/routes/api/ai/+server.ts` — understand current request/response shape
- [ ] Read current AI Panel component — understand current payload sent to `/api/ai`
- [ ] Confirm `UiContext` type is exported from `src/lib/ai/types.ts`

## Post-Implementation

- [ ] `+server.ts` orchestrates full pipeline (4 stages in sequence)
- [ ] Request validation: rejects missing `projectId` with 400
- [ ] Error handling: OpenRouter errors return 502 (not 500) with sanitized message
- [ ] AI Panel component sends `{ action, uiContext }` payload
- [ ] Manual smoke test performed and documented in `evidence/smoke-test-YYYY-MM-DD.md`
- [ ] `dev-docs/ai-pipeline.md` updated with implemented payload shapes
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
