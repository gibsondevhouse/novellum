---
title: Pipeline Integration
slug: part-003-pipeline-integration
part_number: 3
status: complete
owner: AI Agent
phase: phase-002-prompt-builder-and-model-router
estimated_duration: 1d
---

## Objective

Wire the four pipeline stages together in `src/routes/api/ai/+server.ts`, replacing the raw-prompt implementation from Path 1. The AI panel component must send a structured request (action + uiContext) rather than a raw prompt string.

## Files to Modify

- `src/routes/api/ai/+server.ts` — replace with pipeline-driven handler
- `src/lib/components/ai-panel/AiPanel.svelte` (or equivalent) — update request payload

## New Request Payload Shape

```ts
// POST /api/ai
interface AiRequest {
	action: string; // e.g. "draft", "brainstorm"
	uiContext: UiContext; // from AiTask types.ts
}
```

## New Server Handler Logic

```ts
// Pseudocode — implement in TypeScript
POST /api/ai:
  1. Parse and validate body as AiRequest
  2. resolveTask(action, uiContext) → AiTask
  3. buildContext(task, uiContext.activeProjectId) → AiContext
  4. buildPrompt(task, ctx) → promptString
  5. routeModel(task) → modelId
  6. Call OpenRouter API with { model: modelId, messages: [{ role: 'user', content: promptString }] }
  7. Stream or return response
```

## Validation Rules (server boundary)

- `action` must be a non-empty string ≤ 50 chars
- `uiContext.activeProjectId` must be present (400 if null)
- If OpenRouter returns non-200, return 502 with sanitized error (do not leak API key or raw error body)

## Acceptance Criteria

- [ ] `+server.ts` uses full pipeline; no raw `body.prompt` property
- [ ] Request validation returns 400 for missing `projectId`
- [ ] API errors return 502, never 500 with raw cause
- [ ] AI Panel component updated to send `{ action, uiContext }` instead of `{ prompt }`
- [ ] Manual smoke test: open app, trigger AI panel, verify structured prompt is sent (capture in `evidence/smoke-test-YYYY-MM-DD.md`)
- [ ] `dev-docs/ai-pipeline.md` updated with implemented payload shapes
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
