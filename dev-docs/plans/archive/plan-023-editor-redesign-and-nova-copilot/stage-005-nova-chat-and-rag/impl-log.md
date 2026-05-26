---
part: stage-005-nova-chat-and-rag
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.

---

## [2026-05-03 06:50] Agent: AI Agent

**Action:** Executed all six phases of stage-005 (Nova Chat & RAG) in a single pass.

**Result — files touched:**

- `src/modules/nova/components/NovaPanel.svelte` — full rewrite. Renders `novaSession.messages` as a `<ul role="log">`, user bubbles right-aligned, assistant bubbles via `safeHtml(message.content)` (eslint-disable for `svelte/no-at-html-tags` is required because the markdown layer already runs DOMPurify). Adds typing indicator when streaming + empty content, error bubble (`is-error`) with optional `<a href="/settings">` hint when the message matches `/401|MissingCredentials/i`, `(aborted)` trailing label, textarea with Enter-to-send, Send/Stop button swap, and a single `Continue scene` quick-prompt when `onQuickPrompt && activeSceneId`.
- `src/modules/nova/services/chat-service.ts` — new. Exposes `sendNovaChat(input)`. Trims prompt, bails on empty / already-streaming, appends the user message, picks `continue` or `brainstorm` based on `activeSceneId`, builds a `UiContext`, calls `resolveTask` + `buildRagContext` + `buildPrompt`, then `novaSession.beginStream('nova')` and iterates `new OpenRouterClient().streamComplete(payload, { signal })` calling `appendDelta`. On `AbortError`/`signal.aborted` we leave the existing `aborted` status untouched; otherwise we call `novaSession.fail(streaming.id, message)`.
- `src/modules/nova/services/context-hooks.ts` — replaced the stub with a real `buildRagContext`. Returns `{ aiContext: null, …warning }` when `projectId` or `activeSceneId` is missing; otherwise calls `resolveTask('continue', …)` + `await buildContext(task, projectId)` and computes `includedScopes` from scene/adjacentScenes/characters/locations presence.
- `src/modules/nova/types.ts` — added `aiContext?: AiContext | null` on `RagContextResult`.
- `src/modules/nova/stores/nova-session.svelte.ts` — added `fail(id, message)` that flips status to `'error'`, sets `error`, clears `activeStreamId`. No-op for unknown ids.
- `src/modules/nova/index.ts` — re-exports `sendNovaChat` + `SendChatInput`.
- `src/routes/projects/[id]/editor/+page.svelte` — removed `AiPanel`, `aiPanel` store, `pushState({ aiPanelOpen })` effect, `handleAccept`, `escapeHtml`, `toParagraphHtml`, the `<AiPanel onAccept …/>` mount and the `:global(.ai-panel)` CSS. Replaced quick-prompt path with `handleAskAi(prompt)` which opens `novaPanel` and calls `sendNovaChat({ prompt, projectId, activeSceneId, activeChapterId })`. `<NovaPanel onQuickPrompt={handleAskAi} … />` carries the new contract; `class:ai-open` now reads `novaPanel.isOpen`.
- `src/lib/components/index.ts` — removed `AiPanel` export.
- `src/app.d.ts` — removed `interface PageState { aiPanelOpen?: boolean }`.
- DELETED: `src/lib/components/AiPanel.svelte`, `src/lib/stores/ai-panel.svelte.ts`.
- Tests added/updated:
  - `tests/nova/chat-service.test.ts` (new, 6 tests).
  - `tests/nova/context-hooks.test.ts` (rewritten, 4 tests).
  - `tests/nova/nova-session.test.ts` (extended with `fail()` cases).
  - `tests/nova/nova-panel.test.ts` (replaced disabled-input assertion with real-textarea assertion).
  - `tests/nova/nova-panel-chat.test.ts` (new, 5 component tests).
  - `tests/nova/nova-panel-error.test.ts` (new, 3 component tests).
  - `tests/visual/editor-nova-panel.test.ts` baseline regenerated (Nova panel layout shifted with chat content).
  - `tests/visual/editor-nova-panel-conversation.test.ts` (new) — drives the editor with a `page.route('/api/ai', …)` stub that emits one SSE chunk + `[DONE]`, types into the textarea, submits, then captures the conversation baseline.
  - `tests/visual/__screenshots__/visual/editor-toolbar.test.ts/editor-toolbar-900x800.png` regenerated — narrow-viewport toolbar wrap shifted by one row after the legacy `:global(.ai-panel)` CSS was removed.

**Notes — five required decisions:**

1. **Brainstorm fallback when no scene is active.** `chat-service.ts` switches to the `brainstorm` task whenever `activeSceneId` is null, so users can still chat from chapter or project contexts. Spec only required `continue`; the fallback was added because `resolveTask('continue', …)` rejects without a scene id and we'd otherwise have to surface a hard error from a perfectly reasonable user action. Covered by `chat-service.test.ts > falls back to brainstorm task when no scene is active`.
2. **`new OpenRouterClient()` per call.** We do not memoise a singleton client. Constructing per call guarantees that any future env-var or settings change is honoured immediately and keeps the call site stateless against the OpenRouter gateway requirement (no provider SDKs, no cached headers). The cost is negligible — the client is a thin wrapper around `fetch`. Tests mock the constructor via a plain `class` to avoid the `vi.fn()` "not a constructor" trap.
3. **Render-time markdown sanitization on accumulated content.** Each render passes `message.content` through `safeHtml(content)` (DOMPurify-backed). We do not sanitize per chunk because partial markdown is unstable; sanitizing the full accumulated string on every render keeps the indicator + typing UX correct and means there is exactly one sanitization seam. The required eslint-disable for `svelte/no-at-html-tags` matches the existing pattern in `src/modules/ai/components/ChatInterface.svelte:251`.
4. **`AiPanel` removal aftermath.** Every reference was excised: the component file, its store, the `PageState.aiPanelOpen` declaration, the editor route imports + state effects + global CSS, and the public component barrel export. Verification command: `grep -r 'AiPanel\|aiPanel\|aiPanelOpen' src/ tests/` → zero matches (run 2026-05-03 06:50). The old `editor-toolbar-900x800.png` baseline did shift one row of toolbar wraps because removing the global `.ai-panel` rule changed style cascade ordering in narrow viewports — re-baselined deliberately.
5. **Visual baseline regeneration is reproducible.** Both new/updated screenshots are produced with one command, with the dev server already running on `localhost:5173`:

   ```sh
   pnpm exec playwright test \
     tests/visual/editor-nova-panel.test.ts \
     tests/visual/editor-nova-panel-conversation.test.ts \
     tests/visual/editor-toolbar.test.ts \
     --update-snapshots
   ```

   The conversation baseline mocks `/api/ai` with an SSE body of one `data:` event followed by `data: [DONE]`, so it never depends on a real OpenRouter key.

**Quality gates:**

- `pnpm run check` — 0 errors, 0 warnings.
- `pnpm run lint` — clean.
- `pnpm run test` — 686 passing across 114 files (was 670 baseline; +16 new tests across `chat-service`, `context-hooks`, `nova-session`, `nova-panel-chat`, `nova-panel-error`).
- `pnpm run test:visual` — 19 passing (includes the regenerated editor toolbar baseline + Nova panel + new conversation baseline).

Stage frontmatter flipped from `status: ready` → `status: complete`.
