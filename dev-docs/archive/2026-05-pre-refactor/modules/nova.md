# Nova Copilot

> Shipped: plan-023 stages 004–007

## Purpose

Nova is a right-side copilot panel embedded in the editor. It owns AI-assisted chat, retrieval-augmented generation (RAG) over project context, and a scaffolded agentic tool layer for future world-building and continuity actions. Nova replaces the in-content AI command bar removed in plan-023 stage-005.

## Module Location

`src/modules/nova/`

## Architecture

```text
NovaPanel.svelte
  ├── nova-panel.svelte.ts      — panel open/close state (sessionStorage-backed)
  ├── nova-session.svelte.ts    — chat session lifecycle (streaming, abort, signals)
  └── services/
        ├── chat-service.ts     — sendNovaChat() — streams via /api/nova/chat
        ├── context-hooks.ts    — buildRagContext() delegates to $lib/ai/context-engine
        ├── tool-registry.ts    — Map<id, { definition, handler }>
        ├── tool-router.ts      — dispatchTool() — registry dispatch, unimplemented fallback
        ├── stub-tools.ts       — registers four agentic stubs at module load
        ├── feature-flags.ts    — isNovaAgenticEnabled() — env-driven, default off
        └── stream-controller.ts — AbortController wrapper for streaming lifecycle
```

## Public Interface

Nova is re-exported from `src/modules/nova/index.ts`:

```ts
export { NovaPanel } from './NovaPanel.svelte';
export { novaPanel } from './nova-panel.svelte.js';
export { sendNovaChat } from './services/chat-service.js';
```

Consumers (`module-editor`, `routes/projects/[id]/editor`) import from `$modules/nova`.

## Chat Flow

```text
User types → novaSession.send(message) →
  buildRagContext() → sendNovaChat(message, context) →
  streaming SSE from /api/nova/chat →
  novaSession.onChunk() → reactive panel update
```

RAG context is scoped to the active scene + adjacent content via `ContextEngine.buildContext()`. The full manuscript is never sent.

## Agentic Tools (scaffolded)

The tool layer is wired but stubs return `not-yet-supported`. Tool calls are only emitted by the model when `experimental.nova.agentic` is `true` (env var `PUBLIC_NOVELLUM_NOVA_AGENTIC`). The chat loop does not yet thread tool results back through `dispatchTool`.

See `dev-docs/agents-map.md` → "Agentic Tools" section for the full stub roster.

## Guardrails

- Nova never auto-applies changes to the manuscript. All outputs are suggestions.
- Context is scoped — the full manuscript is never forwarded to the model.
- Agentic tools are off by default (`experimental.nova.agentic = false`).

## Module Boundaries

Allowed imports (per `eslint-plugin-boundaries`):

- `module-nova` may import from `lib` and `module-ai`.
- `routes/module-editor` may import from `module-nova`.
- `module-nova` must NOT import from `module-editor`, `module-reader`, or other feature modules.
