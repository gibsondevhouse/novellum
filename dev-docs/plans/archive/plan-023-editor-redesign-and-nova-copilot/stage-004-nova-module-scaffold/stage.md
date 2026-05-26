---
title: Nova Module Scaffold
slug: stage-004-nova-module-scaffold
stage_number: 4
status: complete
owner: Architect Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-module-and-boundaries
  - phase-002-panel-shell
  - phase-003-message-store
  - phase-004-streaming-state
  - phase-005-tool-interfaces
  - phase-006-rag-context-hooks
estimated_duration: 2d
risk_level: medium
---

## Goal

Stand up `src/modules/nova/` with the **full architectural surface** for an editor-side agentic copilot — chat plumbing wires in stage-005, agentic dispatch in stage-006. This stage delivers shells, types, stores, and interfaces that future stages extend without renaming.

## Context (already in tree — do not duplicate)

- Standalone Nova chat lives in `src/modules/ai/components/ChatInterface.svelte`, routed at `/nova`. It owns its own `messages` array, OpenRouter client, context attachments, and streaming flag — all locally scoped to that component. Stage-005 will consume the same machinery from the new module; stage-004 only declares the seams.
- `src/modules/ai/services/nova-context.ts` + `nova-context-planner.ts` already produce `NovaContextResponsePayload` for project + file attachments. The new `module-nova` will call into them in stage-005; this stage exposes the boundary.
- The legacy `AiPanel` (`src/lib/components/AiPanel.svelte` + `src/lib/stores/ai-panel.svelte.ts`) and its single-suggestion overlay remain in place during this stage. Stage-005 deletes them as part of re-wiring `handleAskAi` into Nova quick-prompts.

## Exit Criteria

- New module `src/modules/nova/` registered as a `module-nova` element in `eslint.config.js`. Allowed dependencies:
  - From `module-nova` → `lib`, `module-ai`.
  - From `routes` and `module-editor` → `module-nova`.
- `NovaPanel.svelte` mounted in the editor route as a right-side fixed-width column, behind a toggle. Renders an empty body with placeholder copy ("Hi, I'm Nova"). Coexists with `AiPanel`; both may be open simultaneously this stage.
- Open state persists for the session via `sessionStorage` (key `novellum.nova.panel.open`). Project-scoped session state is documented as a follow-up; the singleton is acceptable for stage-004.
- Message store at `src/modules/nova/stores/nova-session.svelte.ts`: typed `NovaMessage` union (`user | nova | tool-call | tool-result | system`), `append`, `beginStream`, `appendDelta`, `endStream`, `abort`, `clear` actions, derived `latest` and `isStreaming` selectors.
- Streaming state model: each streaming message carries an `AbortController` and a partial-token buffer. `abort()` calls `controller.abort()` and flips status to `aborted`.
- Tool-call interfaces: `ToolDefinition`, `ToolInvocation`, `ToolResult`, `ToolStatus` types in `src/modules/nova/types.ts`. A no-op `tool-router.ts` exports `dispatchTool(invocation): Promise<ToolResult>` returning `{ status: 'unimplemented', toolId, message }`.
- RAG context-builder hook: `src/modules/nova/services/context-hooks.ts` exports `buildRagContext(req: RagContextRequest): Promise<RagContextResult>` as a stub returning empty payload. Documents the `scene_plus_adjacent` policy contract for stage-005.
- Module barrel `src/modules/nova/index.ts` exports the public API: `NovaPanel`, `novaSession`, `novaPanel`, types, and `buildRagContext`.
- All quality gates green: `pnpm run lint` (boundaries clean), `pnpm run check` (0 errors), `pnpm run test` (full suite + new tests), `pnpm run test:visual` (1 new baseline of editor with Nova panel open).
- Nothing user-visible beyond an empty Nova panel rendering placeholder copy when toggled.

## Phases

### Phase-001 — Module setup & boundaries

- Create `src/modules/nova/` with subdirs `components/`, `stores/`, `services/`. Add `index.ts` barrel and `types.ts`.
- Edit `eslint.config.js`:
  - Add element `{ type: 'module-nova', pattern: ['src/modules/nova/**'] }`.
  - Add rule allowing `routes → module-nova` and `module-editor → module-nova`.
  - Add rule allowing `module-nova → lib` and `module-nova → module-ai`.
- Verify with `pnpm run lint` — no new violations.

### Phase-002 — Panel shell

- Create `src/modules/nova/components/NovaPanel.svelte`:
  - Right-side `<aside>` with `role="complementary"`, `aria-label="Nova copilot"`.
  - Header: title "Nova" + close button (`aria-label="Close Nova"`).
  - Body: empty region with placeholder paragraph "Hi, I'm Nova. I'll be ready to help in stage-005."
  - Footer: disabled prompt input placeholder (`aria-disabled="true"`, `title="Coming in stage-005"`).
  - Width: fixed `360px` desktop; below 900px viewport, becomes full-width drawer overlay (sheet).
  - Uses design tokens — no magic colors. Add new tokens if needed (`--nova-panel-width`, `--nova-panel-bg`, `--nova-panel-border`, `--nova-panel-shadow`) in `src/styles/tokens.css`, single source of truth.
- Create panel-state store `src/modules/nova/stores/nova-panel.svelte.ts`:
  - `isOpen` (`$state<boolean>`), `open()`, `close()`, `toggle()`.
  - Hydrates from `sessionStorage` key `novellum.nova.panel.open` on first construction (browser only; SSR-safe guard); persists on change via `$effect` or setter side effect.
- Mount in `src/routes/projects/[id]/editor/+page.svelte`:
  - Import `NovaPanel` and `novaPanel` from `$modules/nova`.
  - Render `<NovaPanel />` at the right side, alongside the existing `<AiPanel />`. Use a sibling `<div class="nova-slot">` in the same flex container.
  - Add a toggle to the toolbar's "View" group in `EditorToolbar.svelte` — label "Nova", icon TBD by Stylist (use sparkles glyph if available; otherwise text label). Clicking calls `novaPanel.toggle()`. Wire via the existing callback prop pattern (`onToggleNova`), driven by `aria-pressed={novaPanel.isOpen}` reactivity.
- Visual baseline: `tests/visual/editor-nova-panel.test.ts` — 1280×800, opens editor with seeded project, clicks the Nova toggle, screenshots.

### Phase-003 — Message store

- `src/modules/nova/types.ts`:

  ```ts
  export type NovaRole = 'user' | 'nova' | 'system' | 'tool-call' | 'tool-result';
  export type NovaMessageStatus =
    | 'pending'
    | 'streaming'
    | 'complete'
    | 'error'
    | 'aborted';
  export interface NovaMessage {
    id: string;
    role: NovaRole;
    content: string;
    status: NovaMessageStatus;
    createdAt: string; // ISO8601
    toolId?: string;
    toolPayload?: unknown;
    error?: string;
  }
  ```

- `src/modules/nova/stores/nova-session.svelte.ts`:

  ```ts
  class NovaSessionStore {
    messages = $state<NovaMessage[]>([]);
    activeStreamId = $state<string | null>(null);
    abortControllers = new Map<string, AbortController>();

    get latest() { return this.messages.at(-1) ?? null; }
    get isStreaming() { return this.activeStreamId !== null; }

    append(input: { role: NovaRole; content: string; status?: NovaMessageStatus; toolId?: string; toolPayload?: unknown }): NovaMessage;
    beginStream(role: NovaRole): NovaMessage; // status='streaming'; registers AbortController; sets activeStreamId
    appendDelta(id: string, delta: string): void;
    endStream(id: string): void;                // status='complete'; clears activeStreamId
    abort(id: string): void;                    // controller.abort(); status='aborted'
    clear(): void;                              // aborts all; clears messages + controllers
  }
  export const novaSession = new NovaSessionStore();
  ```

- IDs come from `crypto.randomUUID()` (browser + jsdom both support); timestamps from `new Date().toISOString()`.
- Tests: `tests/nova/nova-session.test.ts` — append, beginStream/appendDelta/endStream lifecycle, abort flips status, clear resets, derived `latest` + `isStreaming`.

### Phase-004 — Streaming controller helper

- Phase-003's actions own the high-level lifecycle. Isolate the **AbortController plumbing** into `src/modules/nova/services/stream-controller.ts`:
  - `createStreamController(): { signal: AbortSignal; abort(): void }`.
  - Internally wraps `AbortController`; testable in isolation.
- The `nova-session` store consumes `createStreamController` so stage-005's fetch can pass `signal` directly to OpenRouter.
- Test `tests/nova/stream-controller.test.ts` — abort propagates to listeners on `signal`, repeated `abort()` is idempotent.

### Phase-005 — Tool-call interfaces

- `src/modules/nova/types.ts` adds:

  ```ts
  export interface ToolDefinition {
    id: string;            // e.g. 'editor.insertText'
    description: string;
    inputSchema: unknown;  // JSONSchema-shaped; unknown for now
  }
  export interface ToolInvocation {
    invocationId: string;
    toolId: string;
    input: unknown;
    requestedAt: string;
  }
  export type ToolStatus = 'pending' | 'success' | 'error' | 'unimplemented';
  export interface ToolResult {
    invocationId: string;
    toolId: string;
    status: ToolStatus;
    output?: unknown;
    error?: string;
    completedAt: string;
  }
  ```

- `src/modules/nova/services/tool-router.ts`:

  ```ts
  export async function dispatchTool(invocation: ToolInvocation): Promise<ToolResult> {
    return {
      invocationId: invocation.invocationId,
      toolId: invocation.toolId,
      status: 'unimplemented',
      error: `Tool ${invocation.toolId} is not yet implemented (stage-006).`,
      completedAt: new Date().toISOString(),
    };
  }
  ```

- Test `tests/nova/tool-router.test.ts` — returns `unimplemented`, preserves `invocationId` + `toolId`, sets `completedAt`.

### Phase-006 — RAG context hook

- `src/modules/nova/services/context-hooks.ts`:

  ```ts
  export type RagPolicy = 'scene_plus_adjacent' | 'scene_only' | 'project_summary';
  export interface RagContextRequest {
    projectId: string;
    activeSceneId: string | null;
    policy: RagPolicy;
    extraScopes?: string[];
  }
  export interface RagContextResult {
    contextText: string;
    includedScopes: string[];
    warnings: string[];
  }
  export async function buildRagContext(req: RagContextRequest): Promise<RagContextResult> {
    // Stage-004 stub. Stage-005 wires this to module-ai's
    // ContextEngine via the documented scene_plus_adjacent policy.
    return {
      contextText: '',
      includedScopes: [],
      warnings: [`buildRagContext is a stub for ${req.policy}; wires in stage-005.`],
    };
  }
  ```

- Test `tests/nova/context-hooks.test.ts` — returns empty result, echoes policy in warning, accepts each policy variant.

## Test Plan

- **Vitest unit:**
  - `tests/nova/nova-session.test.ts`
  - `tests/nova/stream-controller.test.ts`
  - `tests/nova/tool-router.test.ts`
  - `tests/nova/context-hooks.test.ts`
  - `tests/nova/nova-panel-store.test.ts` (sessionStorage hydration + toggle; jsdom)
- **Component (vitest + Testing Library):**
  - `tests/nova/nova-panel.test.ts` — renders when open, has `role="complementary"`, accessible name "Nova copilot", close button calls `novaPanel.close()`.
- **Visual (Playwright):**
  - `tests/visual/editor-nova-panel.test.ts` — 1280×800 baseline of editor with Nova toggled open. Use the existing seed-project pattern from stage-003's view-in-reader-handoff test.
- **Lint:** `pnpm run lint` — `module-nova` boundaries clean.
- **Type:** `pnpm run check` — 0 errors.

## Decision Log Required

- Whether `AiPanel` coexists with NovaPanel this stage (default: yes; stage-005 deletes AiPanel).
- Scoping of `novaSession`: app-global singleton vs per-project keyed store. Stage-004 ships singleton; document follow-up.
- Tokens added to `tokens.css` for Nova panel surface (list each name + value).
- Confirm `module-nova → module-ai` is the only cross-module dependency declared. No reverse leakage from `module-ai` to `module-nova`.
- Pre-existing visual regressions (12 routes flagged in stage-002 impl-log) remain unaddressed; this stage only adds a new baseline.

## Out of Scope

- Wiring chat to OpenRouter (stage-005).
- Re-routing legacy `aiPanel.toggle()` / `handleAskAi` quick-prompts to Nova (stage-005).
- Implementing any tool dispatch logic (stage-006).
- Settings preference consumption (stage-007 / plan-022).
