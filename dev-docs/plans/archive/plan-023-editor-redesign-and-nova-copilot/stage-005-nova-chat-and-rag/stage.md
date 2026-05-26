---
title: Nova Chat & RAG
slug: stage-005-nova-chat-and-rag
stage_number: 5
status: complete
owner: AI Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-chat-input-and-list
  - phase-002-chat-service-and-prompt
  - phase-003-rag-context-builder
  - phase-004-streaming-and-abort
  - phase-005-error-states-and-aipanel-removal
  - phase-006-tests
estimated_duration: 3d
risk_level: medium
---

## Goal

Wire end-to-end chat between the user and Nova in the editor-side panel: a real prompt input, streaming responses backed by `OpenRouterClient`, RAG context drawn from the active scene + adjacent material, and removal of the legacy `AiPanel`. Quick-prompts (`handleAskAi`) re-route into Nova as the kickoff input.

## Context (already in tree — do not duplicate)

- **Pipeline primitives in `$lib/ai`:**
  - `buildContext(task, projectId)` (`src/lib/ai/context-engine.ts`) — already implements `scene_plus_adjacent` (current scene + previous + next from same chapter, with character/location resolution and per-scene char budget). Returns `AiContext`.
  - `buildPrompt(task, ctx)` (`src/lib/ai/prompt-builder.ts`) — already prepends `NOVA_IDENTITY_BLOCK` and emits a fully-structured prompt (ROLE / TASK / CONTEXT / CONSTRAINTS / OUTPUT FORMAT) with an internal hard truncation at `MAX_PROMPT_CHARS`.
  - `resolveTask(action, uiCtx)` — picks an `AiTask` from `TASK_MAP`. For Nova chat, default to `continue` (policy `scene_plus_adjacent`, `outputFormat: 'prose'`) or, if no `activeSceneId`, `brainstorm` (also `scene_plus_adjacent` but tolerates missing scene).
  - `OpenRouterClient.streamComplete({ model, messages }, { signal })` — proxies to `/api/ai`, yields token chunks. Already accepts `AbortSignal`.
  - `getSelectedModel()` from `$lib/stores/model-selection.svelte.js` — current model id.
- **Module surface from stage-004:**
  - `novaSession` exposes `append`, `beginStream`, `appendDelta`, `endStream`, `abort`, `clear`, `getSignal(id)`, `latest`, `isStreaming`.
  - `novaPanel.isOpen` / `open()` / `close()` / `toggle()`.
  - `buildRagContext(req)` — currently a stub; this stage replaces its body.
  - `dispatchTool` and `tool-router.ts` — untouched (stage-006).
- **Legacy to delete:**
  - `src/lib/components/AiPanel.svelte`
  - `src/lib/stores/ai-panel.svelte.ts`
  - `aiPanelOpen?: boolean` in `src/app.d.ts` (PageState)
  - `<AiPanel />` mount + `aiPanel` import + `pushState({ aiPanelOpen })` logic in editor route
- **Editor route:**
  - `handleAskAi(prompt: string)` lives at line ~575 (suppression comment "Retained for stage-004 Nova re-wire"). Drop the suppression; this stage makes it a real Nova call.
  - `data.project.id`, `editorState.activeSceneId`, and `activeChapter.id` are available; use them as `UiContext`.

## Exit Criteria

- Nova panel renders the full message list from `novaSession.messages` — user bubbles + assistant prose blocks (sanitized markdown via `safeHtml`).
- A real prompt input (textarea + Send button) replaces the disabled placeholder. Disabled while `novaSession.isStreaming`.
- Submitting the input runs the chat pipeline:
  1. Append user message.
  2. Resolve `AiTask` via `resolveTask('continue', uiCtx)` (or `brainstorm` when no scene active).
  3. Build context via the new real `buildRagContext` (which delegates to `buildContext`).
  4. Build prompt via `buildPrompt(task, ctx)` and assemble OpenRouter messages.
  5. `beginStream('nova')` and stream chunks into the new message via `appendDelta`.
  6. `endStream` on completion; `abort` button cancels via `getSignal(id)`.
- Errors (network, `MissingCredentialsError`, server status) surface inline: streaming message status flips to `error` with an `error` message; the user message is preserved.
- Quick-prompts: `handleAskAi(prompt)` opens Nova (if closed) and submits the prompt as the next user message via the same pipeline. The eslint-disable suppression is gone; `handleAskAi` is exercised.
- Legacy AiPanel **deleted** (component + store + PageState entry + editor-route imports + `pushState({ aiPanelOpen })`).
- All quality gates green: `pnpm run lint` (boundaries clean, including the now-removed legacy element), `pnpm run check` (0 errors), `pnpm run test` (full suite + new tests), `pnpm run test:visual` (one new baseline + the existing Nova-open baseline updated to show real chat affordances).

## Phases

### Phase-001 — Chat input and message list

- Edit `src/modules/nova/components/NovaPanel.svelte`:
  - Replace `.nova-placeholder` with a `role="log"` list of messages from `novaSession.messages`. User messages render as right-aligned bubbles; `nova` messages render in a `SurfaceCard` (or token-only card) with `{@html safeHtml(content)}`.
  - When `latest.status === 'streaming'` and `latest.content === ''`, show a typing indicator (mirror `ChatInterface.svelte`'s `<span class="typing">…</span>` markup).
  - Replace the disabled `.nova-input` div with a real `<textarea>` + Send button. Submit on `Enter` (without Shift). Disable both while `novaSession.isStreaming`. Add an `Abort` button that appears in place of `Send` while streaming and calls `novaSession.abort(activeStreamId)`.
  - Local `$state` only for the input value and any focus state. All persistent state lives in `novaSession`.
- Add a `projectId` and `activeSceneId` prop to `NovaPanel.svelte` (typed `string | null`); the editor route passes them.
- Boundaries note: NovaPanel imports `safeHtml` from `$lib/ai/markdown.js`. `module-nova → lib` already permits this.

### Phase-002 — Chat service and prompt construction

- Create `src/modules/nova/services/chat-service.ts`:

  ```ts
  import { OpenRouterClient } from '$lib/ai/openrouter.js';
  import { buildPrompt } from '$lib/ai/prompt-builder.js';
  import { resolveTask } from '$lib/ai/task-resolver.js';
  import type { AiTask, UiContext, AIRequestPayload } from '$lib/ai/types.js';
  import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
  import { novaSession } from '../stores/nova-session.svelte.js';
  import { buildRagContext } from './context-hooks.js';

  export interface SendChatInput {
    prompt: string;
    projectId: string | null;
    activeSceneId: string | null;
    activeChapterId: string | null;
  }

  export async function sendNovaChat(input: SendChatInput): Promise<void> {
    if (!input.prompt.trim() || novaSession.isStreaming) return;

    novaSession.append({ role: 'user', content: input.prompt.trim(), status: 'complete' });

    const action = input.activeSceneId ? 'continue' : 'brainstorm';
    const uiCtx: UiContext = {
      activeProjectId: input.projectId,
      activeSceneId: input.activeSceneId,
      activeChapterId: input.activeChapterId,
      activeBeatId: null,
      instruction: input.prompt.trim(),
    };
    const task: AiTask = resolveTask(action, uiCtx);

    const rag = await buildRagContext({
      projectId: input.projectId ?? '',
      activeSceneId: input.activeSceneId,
      policy: 'scene_plus_adjacent',
    });

    const systemPrompt = rag.aiContext
      ? buildPrompt(task, rag.aiContext)
      : buildPrompt(task, /* empty AiContext */);

    const streaming = novaSession.beginStream('nova');
    const signal = novaSession.getSignal(streaming.id);

    const payload: AIRequestPayload = {
      model: getSelectedModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.prompt.trim() },
      ],
    };

    const client = new OpenRouterClient();
    try {
      for await (const chunk of client.streamComplete(payload, { signal })) {
        novaSession.appendDelta(streaming.id, chunk);
      }
      novaSession.endStream(streaming.id);
    } catch (err) {
      // Phase-005 wires the typed error display.
      novaSession.fail(streaming.id, err instanceof Error ? err.message : 'Unknown error');
    }
  }
  ```

- Add a `fail(id, message)` action to `nova-session.svelte.ts` that flips `status` to `error`, sets `error`, and clears `activeStreamId`. (If stage-004 didn't ship this, add it now.)
- The "empty AiContext" fallback: when `rag.aiContext` is null (no scene), call `buildPrompt(task, emptyContextLike)` where `emptyContextLike` is a minimal `AiContext` with `policy: 'scene_plus_adjacent'`, `scene: null`, all arrays empty. Define a small `EMPTY_AI_CONTEXT` constant in this service file (DO NOT export from `$lib/ai`; keep it local).

### Phase-003 — Real RAG context builder

- Replace the body of `src/modules/nova/services/context-hooks.ts`:

  ```ts
  import { buildContext } from '$lib/ai/context-engine.js';
  import { resolveTask } from '$lib/ai/task-resolver.js';
  import type { AiContext } from '$lib/ai/types.js';
  import type { RagContextRequest, RagContextResult } from '../types.js';

  export async function buildRagContext(req: RagContextRequest): Promise<RagContextResult & { aiContext: AiContext | null }> {
    if (!req.projectId || !req.activeSceneId) {
      return {
        aiContext: null,
        contextText: '',
        includedScopes: [],
        warnings: req.activeSceneId ? ['No project id provided.'] : ['No active scene; Nova will respond without scene context.'],
      };
    }
    const task = resolveTask('continue', {
      activeProjectId: req.projectId,
      activeSceneId: req.activeSceneId,
      activeChapterId: null,
      activeBeatId: null,
    });
    const aiContext = await buildContext(task, req.projectId);
    return {
      aiContext,
      contextText: '', // serialized prompt CONTEXT block lives inside buildPrompt; keep this empty for now
      includedScopes: [
        ...(aiContext.scene ? ['scene'] : []),
        ...(aiContext.adjacentScenes.length > 0 ? ['adjacent-scenes'] : []),
        ...(aiContext.characters.length > 0 ? ['characters'] : []),
        ...(aiContext.locations.length > 0 ? ['locations'] : []),
      ],
      warnings: [],
    };
  }
  ```

- Update `RagContextResult` in `src/modules/nova/types.ts` to add an optional `aiContext?: AiContext | null` field. Re-export `AiContext` re-export is **not** needed; the field type imports from `$lib/ai/types`.
- Stage-004's stub return shape stays compatible: keep `contextText`, `includedScopes`, `warnings` keys. The shape is additive.

### Phase-004 — Streaming and abort wiring

- The `Abort` button in `NovaPanel.svelte` becomes the visible affordance: `onclick={() => novaSession.abort(novaSession.activeStreamId!)}`.
- When `chat-service.ts`'s `for await` rejects with an `AbortError` (`err.name === 'AbortError'`), call `novaSession.endStream(id)` (do NOT call `fail`); the message status is already `aborted` from the explicit `abort()` call.
- Keep the partial-content buffer: aborted messages show whatever was streamed so far and a small "(aborted)" trailing label.

### Phase-005 — Error states + AiPanel removal

- Render error messages in `NovaPanel.svelte`:
  - When a `nova` message has `status === 'error'`, render a tinted bubble with `{message.error}` body. If error message contains `"401"` or matches `MissingCredentialsError.name`, append a link "Settings → AI providers" (use `<a href="/settings">`).
- Re-route `handleAskAi(prompt: string)` in `src/routes/projects/[id]/editor/+page.svelte`:

  ```ts
  async function handleAskAi(prompt: string) {
    if (!novaPanel.isOpen) novaPanel.open();
    await sendNovaChat({
      prompt,
      projectId: data.project.id,
      activeSceneId: editorState.activeSceneId,
      activeChapterId: activeChapter?.id ?? null,
    });
  }
  ```

  Drop the `// eslint-disable-next-line @typescript-eslint/no-unused-vars` and the "Retained for stage-004" comment. Rename `_activeChapter` → `activeChapter` (it's now used).
- Delete `<AiPanel onAccept={handleAccept} />` mount, `import AiPanel`, `import { aiPanel }`, all `aiPanel.*` references, the `pushState({ aiPanelOpen })` block, and the `handleAccept` function (or simplify if other consumers exist — verify with `grep`).
- Delete files `src/lib/components/AiPanel.svelte` and `src/lib/stores/ai-panel.svelte.ts`.
- Remove `aiPanelOpen?: boolean;` from `src/app.d.ts` PageState declaration.
- Verify no stale references: `grep -r 'AiPanel\|aiPanel\|aiPanelOpen'` should return zero matches.

### Phase-006 — Tests

- **Unit (vitest):**
  - `tests/nova/chat-service.test.ts` — mock `OpenRouterClient.streamComplete` (async generator yielding chunks); assert message lifecycle (`user` appended, `nova` `streaming` → `complete`, content concatenated). Cover happy path + abort + error.
  - `tests/nova/context-hooks.test.ts` — replace stage-004's stub assertions. Mock `buildContext` from `$lib/ai/context-engine`. Cover: missing projectId/sceneId → null aiContext; success → scopes populated.
  - `tests/nova/nova-session.test.ts` — extend to cover `fail(id, msg)`.
- **Component (vitest + Testing Library):**
  - `tests/nova/nova-panel-chat.test.ts` — given a mocked `chat-service`, typing into the textarea + clicking Send appends user + nova messages. Streaming state shows typing indicator. Abort button replaces Send while streaming.
  - `tests/nova/nova-panel-error.test.ts` — error status renders error bubble; 401 includes Settings link.
- **Visual (Playwright):**
  - Update `tests/visual/editor-nova-panel.test.ts` baseline to reflect real chat affordances (textarea + Send) — overwrite the existing PNG.
  - Add `tests/visual/editor-nova-panel-conversation.test.ts` — pre-seed `novaSession` via `page.evaluate(() => window.__novaSeed?.(...))` (expose a seam in dev only; OR simply type into the textarea and click Send while mocking `/api/ai` via Playwright route handler). Take 1280×800 screenshot of a conversation state.
- **Quality gates:** `pnpm run lint`, `pnpm run check`, `pnpm run test`, `pnpm run test:visual`. Boundaries must remain clean — `module-nova` may import `$lib/ai/*` and `$lib/stores/*`; both fall under `lib`, already allowed.

## Decision Log Required

- Default action when no active scene: `brainstorm` vs `continue` (this spec says `brainstorm`; record final choice).
- Whether to register the chat service as a singleton or instantiate `OpenRouterClient` per call (this spec says per call — cheap; record).
- Where the markdown sanitization happens for streaming chunks: per-chunk vs render-time. Default render-time using `safeHtml(content)` on the full accumulated content. Record final choice + perf note.
- AiPanel removal aftermath: list every file/line touched and confirm `grep` returns zero matches.
- Visual baseline update strategy: how `editor-nova-panel.png` was regenerated (reproducible playwright command).

## Out of Scope

- Tool-call dispatch (stage-006).
- Project + file attachments in the editor-side Nova panel (the standalone `/nova` route keeps that affordance; editor panel is scene-scoped only this stage).
- Persisting messages across reload (still session-only; persistence is a future plan).
- Settings preference consumption (stage-007 / plan-022).
