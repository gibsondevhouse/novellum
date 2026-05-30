# Context Grounding Audit (2026-05-27)

## Files changed
- `src/routes/nova/+page.svelte` (inspected)
- `src/modules/ai/components/ChatInterface.svelte` (inspected)
- `src/modules/nova/components/NovaPanel.svelte` (inspected)
- `src/modules/nova/services/context-hooks.ts`
- `src/modules/nova/services/chat-service.ts`
- `dev-docs/04-modules/nova.md`

## Surface map result
- Embedded editor sidepanel (`src/modules/nova/*`) is the active production-facing runtime path.
- `/nova` route is still powered by `src/modules/ai/components/ChatInterface.svelte` and diverges in context assembly and UI behavior.
- Drift risk confirmed: sidepanel uses `buildPrompt` + `buildRagContext`; `/nova` uses `planNovaContext` + `/api/nova/context` request path.

## Reproduction (pre-fix branch behavior)
- In `buildRagContext()`, when `activeSceneId` was null and policy was not `outline_scope`, it returned `{ aiContext: null, includedScopes: [], warnings: ['No active scene...'] }`.
- This produced ungrounded responses for Project Hub projects that had metadata (title/logline/synopsis) but zero scenes.

## Context contract inventory
- Context source: `src/modules/nova/services/context-hooks.ts` delegates to `buildContext()`.
- Prompt serialization: `src/lib/ai/prompt-builder.ts`.
- Disclosure state: `src/modules/nova/stores/nova-session.svelte.ts` + `src/modules/nova/components/ContextDisclosurePill.svelte`.
- Null/empty context branches were identified and replaced with baseline-first behavior in stage-001 implementation.

## Commands run
- `pnpm exec vitest run tests/nova/context-hooks.test.ts`
- `pnpm exec vitest run tests/ai/prompt-builder.test.ts`

## Known limitations
- `/nova` full-screen route remains deferred and is not yet reconciled with sidepanel runtime behavior in this phase.
