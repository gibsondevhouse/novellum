---
title: Nova Agentic Stubs
slug: stage-006-nova-agentic-stubs
stage_number: 6
status: complete
owner: AI Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-tool-status-and-registry
  - phase-002-stub-tool-handlers
  - phase-003-feature-flag
  - phase-004-tool-call-rendering
  - phase-005-docs-and-tests
estimated_duration: 1d
risk_level: low
---

## Goal

Define the agentic tool surface so future plans can switch capabilities on without re-architecting Nova. **Nothing executes side effects.** Stubs return `not-yet-supported` and are gated behind a feature flag that defaults `false`. The model is permitted to *emit* tool calls only when the flag is on; the panel renders tool-call / tool-result message envelopes correctly either way.

## Context (already in tree — do not duplicate)

- `src/modules/nova/types.ts` already declares `ToolDefinition`, `ToolInvocation`, `ToolStatus`, `ToolResult`. Current `ToolStatus = 'pending' | 'success' | 'error' | 'unimplemented'`. Extend, do not rename.
- `src/modules/nova/services/tool-router.ts` is the no-op dispatcher. It currently returns `unimplemented` for every invocation. This stage replaces its body with a registry-driven dispatcher.
- `src/modules/nova/stores/nova-session.svelte.ts` already supports `tool-call` and `tool-result` roles in the `NovaRole` union — `append({ role: 'tool-call', ... })` works today.
- `NovaMessage.toolId` and `NovaMessage.toolPayload` are already typed.
- No central feature-flag system exists in the codebase (verified). A small module-local flag is acceptable; if a global flag system lands later, migrate then.
- `dev-docs/agents-map.md` documents the runtime agent ecosystem; a new "Agentic Tools (scaffolded, unwired)" section belongs here.

## Exit Criteria

- `ToolStatus` extended with `'not-yet-supported'`. Existing `'unimplemented'` stays; the two carry different semantics:
  - `not-yet-supported`: tool **is** registered, handler intentionally returns this status (stubbed).
  - `unimplemented`: tool id is **not** registered with the router.
- A tool registry at `src/modules/nova/services/tool-registry.ts` exports a `Map<string, ToolHandler>` and registration helpers. Four stub tools registered:
  - `worldbuilding.create-character` — input: `{ name: string; role?: string; summary?: string }`
  - `worldbuilding.update-location` — input: `{ locationId: string; patch: Record<string, unknown> }`
  - `continuity.scan-scene` — input: `{ sceneId: string }`
  - `outline.suggest-beat` — input: `{ chapterId: string; afterBeatId?: string }`
- Each handler is a pure no-op returning `{ status: 'not-yet-supported', output: null, error: 'Tool <id> is registered but not yet wired (planned for plan-XXX).' }`. Error string includes the future-plan placeholder string `plan-XXX` — no real plan id required this stage.
- `dispatchTool(invocation)` looks up the tool id in the registry. Registered → run handler, wrap result in `ToolResult`. Unregistered → return `{ status: 'unimplemented' }` (existing behavior preserved).
- Feature flag at `src/modules/nova/services/feature-flags.ts` exposes a typed flag object; `experimental.nova.agentic` defaults `false`. Reads from `import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC` (truthy → on) **and** an in-memory override `setNovaAgenticFlag(value: boolean)` for tests. Flag is checked **only** by `chat-service.ts` when constructing the OpenRouter request: when off, no tool definitions are advertised; when on, `ToolDefinition[]` is passed (stage-006 does not wire OpenRouter tool-call schema — see "Out of Scope").
- `NovaPanel.svelte` renders `tool-call` and `tool-result` messages distinctly:
  - `tool-call` → labeled chip `Calling tool: <toolId>` with a collapsible `<details>` block for input JSON.
  - `tool-result` → labeled chip `Result: <toolId> — <status>` with collapsible JSON. `not-yet-supported` and `error` use the existing error/warning surface tokens.
- `dev-docs/agents-map.md` gains an "Agentic Tools (scaffolded — not yet wired)" section listing the four stubs with input schemas and the anchor plan-id placeholder.
- All quality gates green: `pnpm run lint`, `pnpm run check`, `pnpm run test`, `pnpm run test:visual`.

## Phases

### Phase-001 — Tool status + registry

- Edit `src/modules/nova/types.ts`:
  - `ToolStatus` becomes `'pending' | 'success' | 'error' | 'unimplemented' | 'not-yet-supported'`.
  - Add `export type ToolHandler = (invocation: ToolInvocation) => Promise<Pick<ToolResult, 'status' | 'output' | 'error'>>;`
- Create `src/modules/nova/services/tool-registry.ts`:

  ```ts
  import type { ToolDefinition, ToolHandler } from '../types.js';

  interface RegisteredTool {
    definition: ToolDefinition;
    handler: ToolHandler;
  }

  const registry = new Map<string, RegisteredTool>();

  export function registerTool(definition: ToolDefinition, handler: ToolHandler): void {
    registry.set(definition.id, { definition, handler });
  }

  export function getTool(id: string): RegisteredTool | undefined {
    return registry.get(id);
  }

  export function listTools(): ToolDefinition[] {
    return Array.from(registry.values()).map((r) => r.definition);
  }

  export function clearTools(): void {
    registry.clear(); // test hygiene only
  }
  ```

- Replace `src/modules/nova/services/tool-router.ts`:

  ```ts
  import type { ToolInvocation, ToolResult } from '../types.js';
  import { getTool } from './tool-registry.js';

  export async function dispatchTool(invocation: ToolInvocation): Promise<ToolResult> {
    const completedAt = new Date().toISOString();
    const tool = getTool(invocation.toolId);
    if (!tool) {
      return {
        invocationId: invocation.invocationId,
        toolId: invocation.toolId,
        status: 'unimplemented',
        error: `Tool ${invocation.toolId} is not registered.`,
        completedAt,
      };
    }
    try {
      const partial = await tool.handler(invocation);
      return {
        invocationId: invocation.invocationId,
        toolId: invocation.toolId,
        status: partial.status,
        output: partial.output,
        error: partial.error,
        completedAt,
      };
    } catch (err) {
      return {
        invocationId: invocation.invocationId,
        toolId: invocation.toolId,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown handler error.',
        completedAt,
      };
    }
  }
  ```

### Phase-002 — Stub tool handlers

- Create `src/modules/nova/services/stub-tools.ts`:

  ```ts
  import type { ToolDefinition, ToolHandler } from '../types.js';
  import { registerTool } from './tool-registry.js';

  function notYetSupported(toolId: string): ToolHandler {
    return async () => ({
      status: 'not-yet-supported',
      output: null,
      error: `Tool ${toolId} is registered but not yet wired (planned for plan-XXX).`,
    });
  }

  export const STUB_TOOLS: ToolDefinition[] = [
    {
      id: 'worldbuilding.create-character',
      description: 'Create a character entry in the project world bible.',
      inputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          summary: { type: 'string' },
        },
      },
    },
    {
      id: 'worldbuilding.update-location',
      description: 'Patch fields on an existing location.',
      inputSchema: {
        type: 'object',
        required: ['locationId', 'patch'],
        properties: {
          locationId: { type: 'string' },
          patch: { type: 'object' },
        },
      },
    },
    {
      id: 'continuity.scan-scene',
      description: 'Run a continuity check on the named scene.',
      inputSchema: {
        type: 'object',
        required: ['sceneId'],
        properties: { sceneId: { type: 'string' } },
      },
    },
    {
      id: 'outline.suggest-beat',
      description: 'Suggest a new beat under the named chapter.',
      inputSchema: {
        type: 'object',
        required: ['chapterId'],
        properties: {
          chapterId: { type: 'string' },
          afterBeatId: { type: 'string' },
        },
      },
    },
  ];

  export function registerStubTools(): void {
    for (const def of STUB_TOOLS) registerTool(def, notYetSupported(def.id));
  }
  ```

- Call `registerStubTools()` from `src/modules/nova/index.ts` at module load (top-level side effect — acceptable here because the registry is module-local and the call is idempotent if `clearTools()` is followed by re-registration). Alternatively expose it as a function and call from the editor route's `<script>` lifecycle. **Pick option A (module-load side effect)** — simpler and matches the singleton ergonomics already used by `novaSession`.

### Phase-003 — Feature flag

- Create `src/modules/nova/services/feature-flags.ts`:

  ```ts
  let override: boolean | null = null;

  function readEnvFlag(): boolean {
    if (typeof import.meta === 'undefined') return false;
    const raw = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.PUBLIC_NOVELLUM_NOVA_AGENTIC;
    if (typeof raw !== 'string') return false;
    return /^(1|true|on|yes)$/i.test(raw.trim());
  }

  export function isNovaAgenticEnabled(): boolean {
    return override ?? readEnvFlag();
  }

  /** Test-only override. */
  export function setNovaAgenticFlag(value: boolean | null): void {
    override = value;
  }
  ```

- Edit `src/modules/nova/services/chat-service.ts`:
  - Import `isNovaAgenticEnabled` from `./feature-flags.js` and `listTools` from `./tool-registry.js`.
  - Construct the OpenRouter payload with an additional `tools` field **only** when `isNovaAgenticEnabled() === true`. The `tools` shape can be `listTools()` directly — stage-006 does NOT serialize to OpenRouter's exact tool-call schema; just attach the array for downstream stages. Add a `// stage-006: tool dispatch is not yet wired end-to-end` comment so future readers understand.
  - Off path: zero behavior change from stage-005.
- Export `isNovaAgenticEnabled`, `setNovaAgenticFlag` from `src/modules/nova/index.ts`.

### Phase-004 — Tool-call rendering in NovaPanel

- Edit `src/modules/nova/components/NovaPanel.svelte`:
  - Extend the message list `{#each}` to handle two new role cases:
    - `tool-call`: render a chip-styled bubble "Calling tool: `<toolId>`" with a `<details><summary>Input</summary><pre>{JSON.stringify(message.toolPayload, null, 2)}</pre></details>` block.
    - `tool-result`: chip "Result: `<toolId>` — `<status>`" using `is-error` styling for `error` / `not-yet-supported` statuses, success styling otherwise.
  - All chip surfaces use existing tokens (`--color-surface-overlay`, `--color-text-secondary`). No new tokens.
- The chat pipeline does NOT auto-emit tool-calls from `chat-service.ts` this stage; the rendering is exercised by tests (and by future plans that will call `novaSession.append({ role: 'tool-call', ... })`).

### Phase-005 — Docs + tests

- Edit `dev-docs/agents-map.md`: append an "Agentic Tools (scaffolded — not yet wired)" section after the Runtime Agents table. List each stub tool's id, description, input schema summary, and a "Planned: plan-XXX" anchor.
- **Tests:**
  - `tests/nova/tool-registry.test.ts` (new) — register/get/list/clear; double-register replaces.
  - `tests/nova/tool-router.test.ts` (extend) — registered tool path returns handler's status; unregistered → `unimplemented`; throwing handler → `error`.
  - `tests/nova/stub-tools.test.ts` (new) — `registerStubTools()` populates registry with all four ids; each handler returns `not-yet-supported` with `output: null` and a message containing `plan-XXX`.
  - `tests/nova/feature-flags.test.ts` (new) — default `false`; `setNovaAgenticFlag(true)` returns `true`; env truthy values (`'1'`, `'true'`, `'on'`, `'yes'`) parsed correctly; falsy / missing → `false`.
  - `tests/nova/chat-service.test.ts` (extend) — when flag is off, payload has no `tools`; when on, payload has `tools` matching registry length.
  - `tests/nova/nova-panel-tools.test.ts` (new, component) — append a `tool-call` message → renders `Calling tool: <id>` + `<details>`. Append a `tool-result` with `not-yet-supported` → renders an error-styled chip.
- **Visual:** add `tests/visual/editor-nova-panel-tools.test.ts` with one baseline at 1280×800 showing a `tool-call` + `tool-result` pair (use the in-page seed pattern from `editor-nova-panel-conversation.test.ts`).

## Decision Log Required

- Whether to extend `ToolStatus` with `not-yet-supported` vs reuse `unimplemented`. (Spec: extend; record final.)
- Module-load registration vs explicit boot call. (Spec: module-load; record final.)
- Where the feature flag lives — module-local for now vs introduce a global `$lib/feature-flags`. (Spec: module-local; record final + follow-up note for global system.)
- Decision on whether `chat-service.ts` should attach `tools` to the OpenRouter payload now, or strictly gate the *emission* of tool-calls behind a future stage. (Spec: attach when flag on, don't yet serialize to OpenRouter's tool schema; record.)
- Visual baseline strategy for tool-call rendering — record the test-seed pattern used.

## Out of Scope

- Wiring any tool to a real handler — that lands in plan-024 (worldbuilding tools), plan-025 (continuity), plan-026 (outline) per the documentation placeholder.
- OpenRouter tool-call response parsing in `OpenRouterClient` — when the model emits a tool call, this stage does NOT route it back through `dispatchTool`. The chat loop ignores tool-call deltas; future stages thread them through `novaSession.append({ role: 'tool-call', ... })`.
- UI affordances for *initiating* a tool call from the panel (no buttons; tools are model-driven only).
- Settings preference consumption for the agentic flag (stage-007 / plan-022).
