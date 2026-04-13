---
part: part-001-context-builder-integration
phase: phase-002-suggestion-flow
stage: stage-004-ai-interaction-layer
---

# Checklist — Context Builder Integration

## Pre-Implementation

- [ ] `phase-001-ai-assistant-panel` is `complete`
- [ ] `db.scenes`, `db.beats`, `db.characters`, `db.projects` tables exist in Dexie schema
- [ ] `novellum-docs/docs/ai-orchestration.md` reviewed — context payload policy confirmed
- [ ] [OpenRouter messages format](https://openrouter.ai/docs/requests#messages) reviewed

## Post-Implementation

- [x] `src/lib/ai/context-builder.ts` created (`buildContext` export)
- [x] `src/lib/ai/types.ts` updated (`AiContext` interface added)
- [x] `src/lib/ai/serializer.ts` created (`serializeContext` export)
- [ ] `aiStore.requestSuggestion` calls `buildContext` before sending request
- [ ] `/api/ai` endpoint accepts `messages` array body format
- [ ] System prompt verified to include project title, character names, adjacent beats
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] `dev-docs/ai-pipeline.md` updated with implemented context payload shape
- [x] `impl.log.md` updated with completion entry
