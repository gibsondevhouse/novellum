---
title: AI Category
slug: stage-005-ai-category
stage_number: 5
status: complete
owner: AI Agent
plan: plan-022-settings-ia
phases:
  - phase-001-provider-subnav
  - phase-002-openrouter-panel
  - phase-003-coming-soon-stubs
  - phase-004-tests
estimated_duration: 1d
risk_level: low
---

## Goal

Restructure `src/routes/settings/ai/+page.svelte` around a provider sub-nav (OpenRouter, Ollama, LM Studio). Ship the OpenRouter section in full — wrapping the existing `ApiSettings` component with doc/dashboard links in a new `OpenRouterPanel.svelte` — and scaffold Ollama and LM Studio as "Coming soon" panels via a reusable `ProviderComingSoon.svelte` component. No changes to the key-save behavior introduced in plan-020.

## Context (already in tree — do not duplicate)

- `src/modules/settings/components/ApiSettings.svelte` — full OpenRouter key management component (Svelte 5 `$state`/`$derived`); handles save, test, and delete key flows. Already functional and tested. **Must not be modified in this stage.**
- `src/modules/settings/index.ts` — module barrel; currently exports `ApiSettings`, `ThemeSelector`, theme services, and four repositories.
- `src/routes/settings/ai/+page.svelte` — minimal mount: imports `ApiSettings` from `$modules/settings` and renders it with no other markup.
- `tests/settings/settings-ai-page.test.ts` — two passing tests: (1) `h2` contains "AI Integration"; (2) text "OpenRouter API Key" is present. Both must remain green throughout this stage.
- OpenRouter credential backend fixed in plan-020; this stage is purely structural.
- `src/lib/components/ui/PillNav.svelte` exists but is reserved for the top-level settings navigation (stage-001). Do not nest a second `PillNav` inside this page; use a plain `<div role="tablist"><button>` group styled with design tokens.

## Exit Criteria

- Provider sub-nav renders three entries in `ai/+page.svelte`: **OpenRouter** (active by default, `aria-selected="true"`), **Ollama** (`disabled`, "Coming soon" badge), **LM Studio** (`disabled`, "Coming soon" badge).
- Sub-nav `activeProvider` state is local `$state` — **not persisted** — and defaults to `'openrouter'`.
- When OpenRouter is active, two `<a>` links render above `<ApiSettings />`:
  - "OpenRouter Documentation" → `https://openrouter.ai/docs`
  - "API Keys Dashboard" → `https://openrouter.ai/settings/keys`
  - Both have `target="_blank"` and `rel="noopener noreferrer"`.
- `OpenRouterPanel.svelte` is a thin presentational wrapper — it adds only the two links above `<ApiSettings />`; it introduces no state of its own.
- `ProviderComingSoon.svelte` accepts props `name: string` and `description: string`; renders a card with the provider name, description, and a visible "Coming soon" badge; no save logic; no crash path.
- `OpenRouterPanel` and `ProviderComingSoon` are exported from `src/modules/settings/index.ts`.
- `src/modules/settings/components/ApiSettings.svelte` is **not modified**.
- Existing `settings-ai-page.test.ts` tests still green; new sub-nav, link, and coming-soon tests all pass.
- Quality gates: `pnpm run lint`, `pnpm run check`, `pnpm run test` all clean; `eslint-plugin-boundaries` passes — no cross-module leakage.

## Phases

### Phase-001 — Provider sub-nav

**Goal:** Add local `$state` provider selector to `ai/+page.svelte` and render a button-group sub-nav. Conditionally render the OpenRouter section vs. a temporary coming-soon placeholder (real components land in phases 002 and 003).

**Files changed:**

- `src/routes/settings/ai/+page.svelte` — sole file modified in this phase.

**Implementation notes:**

- Add `let activeProvider = $state<'openrouter' | 'ollama' | 'lm-studio'>('openrouter')` using the Svelte 5 `$state` rune. Do **not** name the variable `state` (reserved word conflict — see repo gotchas).
- Render a `<div class="provider-subnav" role="tablist">` containing three `<button>` elements:
  - OpenRouter: `role="tab"`, `aria-selected={activeProvider === 'openrouter'}`, `onclick={() => (activeProvider = 'openrouter')}`.
  - Ollama: `role="tab"`, `disabled`, includes a `<span class="badge-soon">Coming soon</span>`.
  - LM Studio: `role="tab"`, `disabled`, same badge pattern.
- Active button gets `data-active="true"`; style with `--color-surface-overlay`, `--color-accent-*`, or similar tokens — no magic colors.
- Below the sub-nav, use `{#if activeProvider === 'openrouter'} … {:else if activeProvider === 'ollama'} … {:else} … {/if}` conditional blocks. At this phase, bodies can be bare placeholder text such as `<p>OpenRouter panel</p>` and `<p>Ollama — coming soon</p>`.
- No new imports yet; real component mounts arrive in phases 002 and 003.

**Acceptance:**

- Sub-nav renders with three buttons; OpenRouter has `aria-selected="true"`; Ollama and LM Studio buttons carry the `disabled` attribute.
- Conditional section toggles via local state (verifiable in test by DOM inspection of the active block's content).
- Design-token-only styles; `pnpm run lint` clean.

---

### Phase-002 — OpenRouter panel component

**Goal:** Create `OpenRouterPanel.svelte`, wire it into `ai/+page.svelte`, and export it from the module barrel.

**Files changed:**

- `src/modules/settings/components/OpenRouterPanel.svelte` — new file.
- `src/modules/settings/index.ts` — add export.
- `src/routes/settings/ai/+page.svelte` — swap placeholder body with `<OpenRouterPanel />` inside the `activeProvider === 'openrouter'` block; update import.

**Implementation notes for `OpenRouterPanel.svelte`:**

```svelte
<script lang="ts">
  import ApiSettings from './ApiSettings.svelte';
</script>

<div class="openrouter-links">
  <a
    href="https://openrouter.ai/docs"
    target="_blank"
    rel="noopener noreferrer"
    class="provider-link"
  >
    OpenRouter Documentation
  </a>
  <a
    href="https://openrouter.ai/settings/keys"
    target="_blank"
    rel="noopener noreferrer"
    class="provider-link"
  >
    API Keys Dashboard
  </a>
</div>

<ApiSettings />

<style>
  .openrouter-links {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }
  .provider-link {
    font-size: var(--text-sm);
    color: var(--color-accent-default);
    text-decoration: underline;
  }
  .provider-link:hover {
    color: var(--color-accent-hover);
  }
</style>
```

- The component owns no state; it is pure composition.
- In `ai/+page.svelte`, import via the barrel: `import { OpenRouterPanel } from '$modules/settings'`.
- Barrel entry to add: `export { default as OpenRouterPanel } from './components/OpenRouterPanel.svelte';`

**Acceptance:**

- `<OpenRouterPanel />` renders both anchors with correct `href`, `target="_blank"`, `rel="noopener noreferrer"`.
- `ApiSettings` heading "AI Integration" and key field "OpenRouter API Key" remain in the DOM — existing test assertions still pass.
- Barrel export resolves without error; `pnpm run check` clean.

---

### Phase-003 — Coming soon stubs

**Goal:** Create `ProviderComingSoon.svelte`, wire Ollama and LM Studio entries in `ai/+page.svelte`.

**Files changed:**

- `src/modules/settings/components/ProviderComingSoon.svelte` — new file.
- `src/modules/settings/index.ts` — add export.
- `src/routes/settings/ai/+page.svelte` — replace placeholder coming-soon text with `<ProviderComingSoon>` mounts; update imports.

**Implementation notes for `ProviderComingSoon.svelte`:**

```svelte
<script lang="ts">
  interface Props {
    name: string;
    description: string;
  }
  const { name, description }: Props = $props();
</script>

<div class="coming-soon-card" role="region" aria-label="{name} — coming soon">
  <div class="coming-soon-header">
    <h3 class="coming-soon-name">{name}</h3>
    <span class="badge-soon">Coming soon</span>
  </div>
  <p class="coming-soon-desc">{description}</p>
</div>

<style>
  .coming-soon-card {
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-6);
    max-width: 600px;
    background: var(--color-surface-ground);
  }
  .coming-soon-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }
  .coming-soon-name {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }
  .badge-soon {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    background: var(--color-surface-overlay);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }
  .coming-soon-desc {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
```

- Props use Svelte 5 `$props()` rune — **not** `export let`.
- No event handlers, no save logic, no crash path.
- Wiring in `ai/+page.svelte` conditional blocks:

  ```svelte
  {:else if activeProvider === 'ollama'}
    <ProviderComingSoon
      name="Ollama"
      description="Run open-source models locally. No API key required."
    />
  {:else}
    <ProviderComingSoon
      name="LM Studio"
      description="Use any GGUF model via the LM Studio local server."
    />
  ```

- Barrel entry to add: `export { default as ProviderComingSoon } from './components/ProviderComingSoon.svelte';`
- Import in `ai/+page.svelte` via the barrel: `import { OpenRouterPanel, ProviderComingSoon } from '$modules/settings'`.

**Acceptance:**

- `ProviderComingSoon` renders in the Ollama and LM Studio branches; a card with the correct name, description, and badge is present.
- No save logic executes; no API call is made.
- `$props()` rune used (Svelte 5); `pnpm run check` and `pnpm run lint` clean.

---

### Phase-004 — Tests

**Goal:** Update and extend the test suite to cover provider sub-nav rendering, OpenRouterPanel links, and ProviderComingSoon component output.

**Files changed:**

- `tests/settings/settings-ai-page.test.ts` — extend with sub-nav assertions (do not replace existing tests).
- `tests/settings/openrouter-panel.test.ts` — new file.
- `tests/settings/provider-coming-soon.test.ts` — new file.

**New assertions to add to `tests/settings/settings-ai-page.test.ts`:**

```ts
it('renders the provider sub-nav with three buttons', () => {
  component = mount(AiPage, { target, props: {} });
  flushSync();
  const buttons = target.querySelectorAll('[role="tablist"] button');
  expect(buttons.length).toBe(3);
});

it('openrouter button is active by default', () => {
  component = mount(AiPage, { target, props: {} });
  flushSync();
  const buttons = target.querySelectorAll('[role="tablist"] button');
  expect(buttons[0].getAttribute('aria-selected')).toBe('true');
});

it('ollama and lm-studio buttons are disabled', () => {
  component = mount(AiPage, { target, props: {} });
  flushSync();
  const buttons = target.querySelectorAll('[role="tablist"] button');
  expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
  expect((buttons[2] as HTMLButtonElement).disabled).toBe(true);
});
```

**`tests/settings/openrouter-panel.test.ts` — new file:**

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

vi.mock('$lib/ai/credential-service.js', () => ({
  migrateLegacyLocalStorage: vi.fn(async () => {}),
  getStatus: vi.fn(async () => null),
  saveKey: vi.fn(),
  deleteKey: vi.fn(),
  testKey: vi.fn(),
}));

vi.mock('$lib/stores/toast.svelte.js', () => ({
  toast: vi.fn(),
}));

import OpenRouterPanel from '../../src/modules/settings/components/OpenRouterPanel.svelte';

describe('OpenRouterPanel.svelte', () => {
  let target: HTMLElement;
  let component: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    if (component) { unmount(component); component = null; }
  });

  it('renders the OpenRouter docs link', () => {
    component = mount(OpenRouterPanel, { target, props: {} });
    flushSync();
    const link = target.querySelector('a[href="https://openrouter.ai/docs"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders the API Keys Dashboard link', () => {
    component = mount(OpenRouterPanel, { target, props: {} });
    flushSync();
    const link = target.querySelector('a[href="https://openrouter.ai/settings/keys"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders the ApiSettings heading through the wrapper', () => {
    component = mount(OpenRouterPanel, { target, props: {} });
    flushSync();
    const heading = target.querySelector('h2');
    expect(heading?.textContent).toContain('AI Integration');
  });
});
```

**`tests/settings/provider-coming-soon.test.ts` — new file:**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

import ProviderComingSoon from '../../src/modules/settings/components/ProviderComingSoon.svelte';

describe('ProviderComingSoon.svelte', () => {
  let target: HTMLElement;
  let component: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    if (component) { unmount(component); component = null; }
  });

  it('renders the provider name', () => {
    component = mount(ProviderComingSoon, {
      target,
      props: { name: 'Ollama', description: 'Run models locally.' },
    });
    flushSync();
    expect(target.querySelector('h3')?.textContent).toContain('Ollama');
  });

  it('renders the description', () => {
    component = mount(ProviderComingSoon, {
      target,
      props: { name: 'Ollama', description: 'Run models locally.' },
    });
    flushSync();
    expect(target.textContent).toContain('Run models locally.');
  });

  it('renders the "Coming soon" badge', () => {
    component = mount(ProviderComingSoon, {
      target,
      props: { name: 'LM Studio', description: 'Use GGUF models.' },
    });
    flushSync();
    const badge = target.querySelector('.badge-soon');
    expect(badge?.textContent?.toLowerCase()).toContain('coming soon');
  });
});
```

**Coverage requirement:** `pnpm run test:coverage` for `OpenRouterPanel.svelte` and `ProviderComingSoon.svelte` must clear **80% line coverage**. Both components are simple; 100% is expected in practice.

**Note on testing Ollama/LM Studio panels from within `AiPage`:** Because those sub-nav buttons are `disabled`, they cannot be clicked in tests. Coverage for those branches is obtained by testing `ProviderComingSoon.svelte` in isolation (`provider-coming-soon.test.ts`). This is intentional; wiring confirmation (that the component is mounted in the right branch) is covered by the sub-nav activation tests and `pnpm run check` type safety.

**Acceptance:**

- `pnpm run test -- --run tests/settings/settings-ai-page.test.ts` green (all 5 tests, including the 2 pre-existing ones).
- `pnpm run test -- --run tests/settings/openrouter-panel.test.ts` green (all 3 tests).
- `pnpm run test -- --run tests/settings/provider-coming-soon.test.ts` green (all 3 tests).
- `pnpm run lint` and `pnpm run check` clean — zero boundary violations.
- `pnpm run test:coverage` shows ≥ 80% line coverage on the two new components.

## Decision Log Required

- **Sub-nav primitive choice:** A plain `<div role="tablist"><button>` pattern is specified over `PillNav` to avoid nesting two navigation levels in the same view. Record whether this holds or if a shared primitive is created instead.
- **Link placement:** Links live in the new `OpenRouterPanel.svelte` wrapper, not injected directly into `ApiSettings.svelte`. This keeps `ApiSettings` unmodified and independently usable. Record if a future stage ever needs `ApiSettings` to own these links.
- **Disabled coming-soon buttons:** Ollama/LM Studio are `disabled` in the sub-nav. The components exist and render but are unreachable by the user at runtime. When integration ships, removing `disabled` is the only UI change needed. Confirm this is acceptable for the current milestone.
- **Barrel additions:** `OpenRouterPanel` and `ProviderComingSoon` are added to the settings module barrel. Both are currently page-local concerns. If `eslint-plugin-boundaries` raises a violation (e.g. routes importing from modules), recheck the boundary rule for `settings → routes/settings`. Record outcome.

## Out of Scope

- Ollama integration, LM Studio integration — parked in `dev-docs/roadmap.md`.
- OpenRouter balance display or model listing.
- Any modification to `src/modules/settings/components/ApiSettings.svelte`.
- Persisting `activeProvider` selection across sessions — local state only.
- Visual (Playwright) baseline for this stage — add only if explicitly requested in a follow-up.
- Provider-specific configuration fields (API base URL, model selection) for Ollama/LM Studio — deferred until integration is built.
