---
title: AI Assistant V1 Scope and UX
slug: stage-005-ai-assistant-v1-scope
stage_number: 5
status: complete
owner: AI Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-ai-session-service
  - phase-002-context-disclosure
  - phase-003-missing-key-empty-state
  - phase-004-model-picker
  - phase-005-error-states
estimated_duration: 5d
risk_level: medium
---

## Goal

Constrain the AI assistant to a defensible V1 scope and ship the UX that makes BYOK + context behavior transparent. Delivers: a reactive credential-status store, a compact context-disclosure pill in the NovaPanel header, a missing-key empty state, an inline model picker, and classified error rendering — all wired into the existing `NovaPanel.svelte` without restructuring the underlying chat service.

> **Absorbs.** plan-016 stage-007 phase-001 (AI Assistant Panel cosmetic refit) transferred here on 2026-04-28. Canonical-panel rhythm and tone goals are folded into this rebuild.

## Context (already in tree — do not duplicate)

- `src/modules/nova/components/NovaPanel.svelte` — sole chat surface for the editor. Has `projectId`, `activeSceneId`, `activeChapterId` props. Contains `isMissingCredentialsError()` helper (inspects `message.error` text). No empty state for missing key, no error boundary component, no model picker in the header yet.
- `src/modules/nova/stores/nova-session.svelte.ts` — `NovaSessionStore` class using Svelte 5 `$state`. Holds `messages`, `activeStreamId`. Does not yet track RAG context disclosure state.
- `src/modules/nova/services/chat-service.ts` — `sendNovaChat` calls `buildRagContext`, resolves `includedScopes: string[]` and per-scope item arrays. Result is currently ephemeral; nothing is stored for UI disclosure.
- `src/modules/nova/services/feature-flags.ts` — single flag `isNovaAgenticEnabled()`. No credential-awareness.
- `src/lib/stores/model-selection.svelte.ts` — exports `AVAILABLE_MODELS: ModelOption[]`, `getSelectedModel()`, `getSelectedModelOption()`. Persists to `app.selectedModel` preference. Verify whether `setSelectedModel(id)` is exported; add it if not.
- `src/routes/api/settings/ai-status/+server.ts` — `GET /api/settings/ai-status?providerId=openrouter` → `json({ configured: boolean, providerId: string })` via `getProviderStatus`.
- `src/lib/components/ui/EmptyStatePanel.svelte` — exists; use for no-key state. Accepts `title`, `description`, `actionLabel`, `actionHref` props (verify exact prop names from file before using).
- No `ai-session-service.ts`, `ContextDisclosurePill.svelte`, `ModelPickerDropdown.svelte`, or `NovaErrorBoundary.svelte` exist yet.
- `src/modules/nova/types.ts` — defines `NovaMessage` (with optional `error: string` field and `status: NovaMessageStatus`). No `NovaErrorType` classification yet.

## Entry Criteria

- plan-017 stage-005 complete: `createCredentialService` and `GET /api/settings/ai-status` route operational.
- plan-018 stage-004 complete: Settings AI section provides key entry UX at `/settings/ai`.
- `pnpm run check` and `pnpm run lint` pass on the current tree before starting.

## Exit Criteria

- `src/modules/nova/services/ai-session-service.ts` exports `AiSessionStore` class and `aiSession` singleton. Store tracks `keyConfigured: boolean`, `providerId: string`, `modelId: string`, `loading: boolean`, `error: string | null`. `hydrate(provider?)` fetches `GET /api/settings/ai-status?providerId={provider}` and sets reactive state. All fields are Svelte 5 `$state`.
- `nova-session.svelte.ts` gains `contextDisclosure: ContextDisclosureState | null` (`$state`) and `setContextDisclosure(scopes, itemCount)` method. `sendNovaChat` calls `setContextDisclosure` after every `buildRagContext` call.
- `src/modules/nova/components/ContextDisclosurePill.svelte` renders a compact pill reading `novaSession.contextDisclosure`; shows "Scene · Characters · N items" when context is present; hidden otherwise.
- `NovaPanel.svelte` calls `aiSession.hydrate()` on mount. When `aiSession.keyConfigured === false` (and not loading), renders `EmptyStatePanel` with title "No AI key configured", description directing to Settings, and CTA href `/settings/ai`. When `true`, renders normal chat UI.
- `src/modules/nova/components/ModelPickerDropdown.svelte` shows the current model label from `getSelectedModelOption()`; dropdown lists `AVAILABLE_MODELS`; selecting calls `setSelectedModel(id)`. Rendered in the NovaPanel header.
- `src/modules/nova/types.ts` exports `NovaErrorType` union (`'rate_limit' | 'invalid_key' | 'context_too_large' | 'network_error' | 'unknown'`) and `classifyNovaError(raw: string): NovaErrorType`.
- `src/modules/nova/components/NovaErrorBoundary.svelte` wraps the NovaPanel message list. Derives `errorType` from the latest failed message via `classifyNovaError`; renders a typed error notice with human-readable title and remediation text. Uses `ErrorNotice` from `src/lib/components/ui/ErrorNotice.svelte` if it exists (stage-008 delivers it); otherwise renders inline with a `// TODO: wire ErrorNotice from stage-008` comment.
- Tests pass:
  - `tests/ai/ai-session-service.test.ts` — hydrate sets `keyConfigured = true`/`false` per API response; `loading` transitions correctly; `error` is set on fetch failure.
  - `tests/ai/missing-key-state.test.ts` — `EmptyStatePanel` renders when `keyConfigured === false`; chat renders when `true`.
  - `tests/ai/provider-errors.test.ts` — each error type (`rate_limit`, `invalid_key`, `context_too_large`, `network_error`) renders the correct inline message from `NovaErrorBoundary`.
- `pnpm run test` passes including all new tests.
- `pnpm run check` clean (zero TypeScript errors).
- `pnpm run lint` clean (`eslint-plugin-boundaries` passes; no module leakage).

## Phases

### Phase-001 — AI session service

**Goal:** Create a reactive Svelte 5 singleton store that tracks whether the active OpenRouter credential is configured, surfacing `keyConfigured`, `providerId`, `modelId`, and fetch lifecycle state to consuming components.

**Files:**
- `src/modules/nova/services/ai-session-service.ts` — new file.

**Implementation:**

Create `src/modules/nova/services/ai-session-service.ts`:

```ts
/**
 * plan-018 stage-005 phase-001 — AI session store.
 *
 * Tracks per-session credential status for the Nova panel.
 * `hydrate()` calls GET /api/settings/ai-status and sets reactive state.
 * Uses Svelte 5 $state — must only be instantiated in browser context
 * or inside a Svelte component tree.
 */
import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';

interface AiStatusResponse {
  configured: boolean;
  providerId: string;
}

export class AiSessionStore {
  keyConfigured = $state<boolean>(false);
  providerId    = $state<string>('openrouter');
  modelId       = $state<string>('');
  loading       = $state<boolean>(false);
  error         = $state<string | null>(null);

  async hydrate(provider = 'openrouter'): Promise<void> {
    this.loading = true;
    this.error   = null;
    try {
      const res = await fetch(
        `/api/settings/ai-status?providerId=${encodeURIComponent(provider)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AiStatusResponse = await res.json() as AiStatusResponse;
      this.keyConfigured = data.configured;
      this.providerId    = data.providerId ?? provider;
    } catch (err) {
      this.error         = err instanceof Error ? err.message : 'Unknown error';
      this.keyConfigured = false;
    } finally {
      this.loading = false;
      this.modelId = getSelectedModel();
    }
  }
}

export const aiSession = new AiSessionStore();
```

**Acceptance checklist:**
- [ ] `aiSession.hydrate()` resolves and sets `keyConfigured = true` when API returns `{ configured: true }`.
- [ ] `keyConfigured` stays `false` when API returns `{ configured: false }`.
- [ ] `loading` is `true` during the fetch and `false` when settled.
- [ ] `error` is set and `keyConfigured = false` when the fetch throws or returns non-OK.
- [ ] `modelId` is populated from `getSelectedModel()` after hydration completes.
- [ ] `pnpm run check` clean.

---

### Phase-002 — Context disclosure pill

**Goal:** Surface the active RAG context scope in the NovaPanel header so authors know exactly what data is being sent to the model on every request.

**Files:**
- `src/modules/nova/stores/nova-session.svelte.ts` — add `contextDisclosure` state and `setContextDisclosure` method.
- `src/modules/nova/services/chat-service.ts` — call `setContextDisclosure` after `buildRagContext`.
- `src/modules/nova/components/ContextDisclosurePill.svelte` — new file.

**Implementation:**

In `NovaSessionStore` (`nova-session.svelte.ts`), append after `activeStreamId = $state(...)`:

```ts
export interface ContextDisclosureState {
  scopes:    string[]; // e.g. ['scene', 'characters', 'locations']
  itemCount: number;   // total items across all scopes
}

// inside the class body:
contextDisclosure = $state<ContextDisclosureState | null>(null);

setContextDisclosure(scopes: string[], itemCount: number): void {
  this.contextDisclosure = { scopes, itemCount };
}
```

In `chat-service.ts`, after the `buildRagContext` try/catch block, before calling `buildPrompt`:

```ts
const itemCount =
  (aiContext.scene ? 1 : 0) +
  aiContext.adjacentScenes.length +
  aiContext.characters.length +
  aiContext.locations.length +
  aiContext.loreEntries.length +
  aiContext.plotThreads.length;
novaSession.setContextDisclosure(rag?.includedScopes ?? [], itemCount);
```

Create `src/modules/nova/components/ContextDisclosurePill.svelte`:

```svelte
<script lang="ts">
  import { novaSession } from '../stores/nova-session.svelte.js';

  const disclosure = $derived(novaSession.contextDisclosure);

  function pillLabel(d: typeof disclosure): string {
    if (!d || d.scopes.length === 0) return '';
    const parts: string[] = [];
    if (d.scopes.includes('scene'))      parts.push('Scene');
    if (d.scopes.includes('characters')) parts.push('Characters');
    if (d.itemCount > 0)                 parts.push(`${d.itemCount} items`);
    return parts.join(' · ');
  }
</script>

{#if disclosure && disclosure.scopes.length > 0}
  <span class="context-pill" title="Context sent to model">{pillLabel(disclosure)}</span>
{/if}

<style>
  .context-pill {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-surface-raised);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }
</style>
```

Add `<ContextDisclosurePill />` to the `NovaPanel.svelte` header row, adjacent to any existing header controls.

**Acceptance checklist:**
- [ ] `novaSession.contextDisclosure` is `null` before the first chat send.
- [ ] After sending with an active scene, pill shows "Scene · Characters · N items".
- [ ] Pill element is absent when `contextDisclosure` is `null` or `scopes` is empty.
- [ ] `setContextDisclosure` is invoked in `chat-service.ts` on every `sendNovaChat` call.

---

### Phase-003 — Missing key empty state

**Goal:** When no API key is configured, replace the chat UI with a clear empty state that directs the user to Settings, eliminating the current silent-failure behavior.

**Files:**
- `src/modules/nova/components/NovaPanel.svelte` — add `onMount` hydration and conditional render.

**Implementation:**

In `NovaPanel.svelte`, add to the `<script>` block imports:

```ts
import { onMount } from 'svelte';
import { aiSession } from '../services/ai-session-service.js';
import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
```

Add reactive derivations after existing `$derived` declarations:

```ts
const keyConfigured = $derived(aiSession.keyConfigured);
const aiLoading     = $derived(aiSession.loading);
```

Add mount hook:

```ts
onMount(() => { void aiSession.hydrate(); });
```

In the template, replace the outermost chat content region with:

```svelte
{#if aiLoading}
  <div class="nova-loading" role="status" aria-label="Checking AI configuration…">
    <span class="nova-loading__pulse"></span>
  </div>
{:else if !keyConfigured}
  <EmptyStatePanel
    title="No AI key configured"
    description="Add your OpenRouter API key in Settings to start using the AI assistant."
    actionLabel="Go to Settings"
    actionHref="/settings/ai"
  />
{:else}
  <!-- existing chat content markup unchanged -->
{/if}
```

Verify `EmptyStatePanel` prop names against `src/lib/components/ui/EmptyStatePanel.svelte` before writing; adapt prop names if they differ.

**Acceptance checklist:**
- [ ] `aiSession.hydrate()` is called exactly once on `onMount`.
- [ ] `EmptyStatePanel` renders with correct title, description, and CTA when `keyConfigured === false`.
- [ ] Normal chat UI renders when `keyConfigured === true`.
- [ ] A loading indicator is shown while `aiLoading === true`.
- [ ] CTA navigates to `/settings/ai`.

---

### Phase-004 — Model picker dropdown

**Goal:** Allow authors to switch the active model from the NovaPanel header without leaving the editor.

**Files:**
- `src/lib/stores/model-selection.svelte.ts` — add `setSelectedModel(id)` export if absent.
- `src/modules/nova/components/ModelPickerDropdown.svelte` — new file.
- `src/modules/nova/components/NovaPanel.svelte` — add to header.

**Implementation:**

In `src/lib/stores/model-selection.svelte.ts`, verify `setSelectedModel` is exported. If absent, add after `getSelectedModelOption`:

```ts
export async function setSelectedModel(id: string): Promise<void> {
  if (!AVAILABLE_MODELS.some((m) => m.id === id)) return;
  selectedModelId = id;
  await setPreference(PREF_KEY, id);
}
```

Create `src/modules/nova/components/ModelPickerDropdown.svelte`:

```svelte
<script lang="ts">
  import {
    AVAILABLE_MODELS,
    getSelectedModelOption,
    setSelectedModel,
  } from '$lib/stores/model-selection.svelte.js';

  const current = $derived(getSelectedModelOption());

  async function pick(id: string) {
    await setSelectedModel(id);
  }
</script>

<div class="model-picker">
  <label class="sr-only" for="nova-model-select">Active model</label>
  <select
    id="nova-model-select"
    value={current.id}
    onchange={(e) => void pick((e.currentTarget as HTMLSelectElement).value)}
  >
    {#each AVAILABLE_MODELS as model (model.id)}
      <option value={model.id}>{model.label}</option>
    {/each}
  </select>
</div>

<style>
  .model-picker select {
    background:    var(--color-surface-raised);
    border:        1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color:         var(--color-text-secondary);
    font-size:     var(--text-xs);
    padding:       var(--space-1) var(--space-2);
    cursor:        pointer;
  }
</style>
```

Add `<ModelPickerDropdown />` to the NovaPanel header, next to `<ContextDisclosurePill />`.

**Acceptance checklist:**
- [ ] Dropdown displays the current model label on mount.
- [ ] Selecting a model calls `setSelectedModel` and persists to preferences.
- [ ] `AVAILABLE_MODELS` drives the options list (no hardcoded model strings in component).
- [ ] `setSelectedModel` is exported from `model-selection.svelte.ts` and follows the existing `setPreference` pattern.

---

### Phase-005 — Error states

**Goal:** Classify API error responses into typed categories and render actionable inline error messages in NovaPanel so authors know what failed and what to do next.

**Files:**
- `src/modules/nova/types.ts` — add `NovaErrorType` and `classifyNovaError`.
- `src/modules/nova/components/NovaErrorBoundary.svelte` — new file.
- `src/modules/nova/components/NovaPanel.svelte` — wrap message list with `<NovaErrorBoundary>`.

**Implementation:**

In `src/modules/nova/types.ts`, append:

```ts
export type NovaErrorType =
  | 'rate_limit'
  | 'invalid_key'
  | 'context_too_large'
  | 'network_error'
  | 'unknown';

export function classifyNovaError(rawError: string): NovaErrorType {
  if (/429|rate.?limit/i.test(rawError))            return 'rate_limit';
  if (/401|invalid.?key|MissingCredentials/i.test(rawError)) return 'invalid_key';
  if (/413|context.?too.?large|token.?limit/i.test(rawError)) return 'context_too_large';
  if (/network|fetch|ECONNREFUSED|Failed to fetch/i.test(rawError)) return 'network_error';
  return 'unknown';
}
```

Create `src/modules/nova/components/NovaErrorBoundary.svelte`:

```svelte
<script lang="ts">
  import { novaSession } from '../stores/nova-session.svelte.js';
  import { classifyNovaError } from '../types.js';
  // TODO: replace inline error markup with <ErrorNotice> once
  // src/lib/components/ui/ErrorNotice.svelte ships in stage-008.
  // import ErrorNotice from '$lib/components/ui/ErrorNotice.svelte';

  interface Props { children: import('svelte').Snippet; }
  let { children }: Props = $props();

  const ERROR_COPY: Record<string, { title: string; message: string }> = {
    rate_limit:       { title: 'Rate limit reached',   message: 'Too many requests — try again in a moment.' },
    invalid_key:      { title: 'API key invalid',       message: 'Update your OpenRouter key in Settings → AI.' },
    context_too_large:{ title: 'Context too large',     message: 'Reduce the active scene length or switch to a model with a larger context window.' },
    network_error:    { title: 'Network error',         message: 'Check your connection and try again.' },
    unknown:          { title: 'Something went wrong',  message: 'An unexpected error occurred.' },
  };

  const failedMessages = $derived(
    novaSession.messages.filter((m) => m.status === 'error' && m.error)
  );
  const latestError  = $derived(failedMessages.at(-1));
  const errorType    = $derived(latestError ? classifyNovaError(latestError.error ?? '') : null);
  const errorCopy    = $derived(errorType ? ERROR_COPY[errorType] : null);
</script>

{@render children()}

{#if errorCopy}
  <div class="nova-error" role="alert">
    <strong class="nova-error__title">{errorCopy.title}</strong>
    <p class="nova-error__message">{errorCopy.message}</p>
  </div>
{/if}

<style>
  .nova-error {
    padding:       var(--space-3) var(--space-4);
    background:    var(--color-status-error-bg, hsl(0 60% 96%));
    color:         var(--color-status-error,    hsl(0 60% 35%));
    border-radius: var(--radius-md);
    margin:        var(--space-2);
    font-size:     var(--text-sm);
  }
  .nova-error__title   { display: block; margin-bottom: var(--space-1); font-weight: var(--font-weight-semibold); }
  .nova-error__message { margin: 0; }
</style>
```

In `NovaPanel.svelte`, import and wrap the message list:

```svelte
import NovaErrorBoundary from './NovaErrorBoundary.svelte';

<!-- template: -->
<NovaErrorBoundary>
  <!-- existing message list markup -->
</NovaErrorBoundary>
```

**Acceptance checklist:**
- [ ] `classifyNovaError('429 rate limit exceeded')` returns `'rate_limit'`.
- [ ] `classifyNovaError('401 MissingCredentials')` returns `'invalid_key'`.
- [ ] `classifyNovaError('413 context too large')` returns `'context_too_large'`.
- [ ] `classifyNovaError('Failed to fetch')` returns `'network_error'`.
- [ ] `classifyNovaError('unexpected')` returns `'unknown'`.
- [ ] Error notice renders when `novaSession.messages` contains a message with `status === 'error'`.
- [ ] Error notice is absent when no error messages exist.
- [ ] `// TODO: wire ErrorNotice from stage-008` comment is present.

---

## Out of Scope

- Automatic manuscript edits or AI bulk-apply actions (post-V1).
- Multi-provider support beyond OpenRouter (post-V1).
- Real-time context disclosure updates mid-stream.
- `AiProviderStatus.svelte` as a standalone route-level component (credential status is surfaced through `aiSession` store in NovaPanel).
- App-owned API keys or mock-response dev paths (explicitly removed in plan-017 stage-005).
- Storybook stories for new components (stage-008 phase-004 handles story coverage).
