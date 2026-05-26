---
title: First-Run Onboarding
slug: stage-006-onboarding
stage_number: 6
status: complete
owner: Architect Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-onboarding-routing
  - phase-002-step-components
  - phase-003-onboarding-shell
  - phase-004-completion-flag
estimated_duration: 4d
risk_level: low
---

## Goal

Ship a first-run onboarding flow that educates new users about local-first storage, BYOK requirements, and backup responsibility before they create their first project. AI key setup is skippable. Completion state is persisted to SQLite preferences and enforced by a `hooks.server.ts` redirect guard.

## Context (already in tree — do not duplicate)

- `src/routes/onboarding/` — does not exist. Must be created.
- `src/hooks.server.ts` — existing `handle` function applies UUID validation, rate limiting, body-size guard, and security headers. The onboarding guard must be additive and inserted after the existing security checks but before `resolve(event)`.
- `src/lib/preferences.js` — client-side `getPreference` / `setPreference` utilities (call `/api/db/preferences/[key]`). Not usable directly from `hooks.server.ts` (no `fetch` in handle scope). Server-side preference reads must go through the DB layer directly — follow the pattern in `/api/db/preferences/[key]/+server.ts`.
- `src/routes/api/settings/ai-key/` — exists; `AiKeyStep` should use the credential service endpoint established in plan-017 stage-005 (not a custom fetch) when saving the key.
- `src/lib/components/ui/EmptyStatePanel.svelte`, `PrimaryButton.svelte`, `GhostButton.svelte`, `SecondaryButton.svelte`, `Input.svelte` — all exist; use for step UI. Do not create new primitives here (that is stage-008's job).
- `Stepper.svelte` — does not exist yet (stage-008 phase-002 delivers it). Use a local `StepDots.svelte` in the onboarding route directory as a placeholder; add a `// TODO: replace with <Stepper> from stage-008` comment.
- No `src/lib/stores/onboarding.svelte.ts` exists yet.
- Tone anchor (from research §25): plain, accurate, trust-first. No marketing copy.

## Entry Criteria

- plan-017 stage-005 complete: credential service and `POST /api/settings/ai-key` route operational.
- plan-017 stage-006 complete: storage APIs available.
- plan-018 stage-001 complete: project creation round-trip works end-to-end.
- `pnpm run check` and `pnpm run lint` pass on the current tree before starting.

## Exit Criteria

- `src/routes/onboarding/+page.svelte` exists and renders `OnboardingShell`.
- `src/lib/stores/onboarding.svelte.ts` exports `OnboardingStore` and `onboarding` singleton. Tracks `completed: boolean`, `currentStep: number`. Persists `currentStep` ephemerally (`$state` only); persists `completed = true` to SQLite via `setPreference('app.onboarding.completed', true)` on final step.
- Step components exist in `src/routes/onboarding/steps/`: `WelcomeStep.svelte`, `LocalFirstStep.svelte`, `StorageStep.svelte`, `BackupStep.svelte`, `AiKeyStep.svelte` (skippable), `CreateProjectStep.svelte`.
- `src/routes/onboarding/OnboardingShell.svelte` renders step progress (local `StepDots.svelte` placeholder), prev/next buttons, and a skip button that jumps directly to the final step. `CreateProjectStep` on completion navigates to `/`.
- `src/hooks.server.ts` guard: for non-API, non-static, non-onboarding page requests, reads `app.onboarding.completed` from SQLite preference via the server-side preference reader. Redirects to `/onboarding` (HTTP 302) if the value is not `true`. Does not redirect requests to `/onboarding`, `/api/*`, or static asset paths.
- On completing the final step (`CreateProjectStep`), `setPreference('app.onboarding.completed', true)` is called, then the app navigates to `/`.
- Tests pass:
  - `tests/onboarding/onboarding-flow.test.ts` — redirect fires when flag is absent/false; redirect is skipped when flag is `true`; `AiKeyStep` skip button advances to `CreateProjectStep` without saving a key.
- `pnpm run test` passes including new tests.
- `pnpm run check` clean.
- `pnpm run lint` clean (`eslint-plugin-boundaries` passes).

## Phases

### Phase-001 — Onboarding routing

**Goal:** Create the onboarding route, the reactive store that tracks step and completion state, and the `hooks.server.ts` guard that forces the flow for new users.

**Files:**

- `src/routes/onboarding/+page.svelte` — new file.
- `src/lib/stores/onboarding.svelte.ts` — new file.
- `src/hooks.server.ts` — add guard (additive edit).

**Implementation:**

Create `src/lib/stores/onboarding.svelte.ts`:

```ts
/**
 * plan-018 stage-006 phase-001 — Onboarding store.
 *
 * Tracks current step (ephemeral) and completion (persisted to SQLite
 * via setPreference on final step). `completed` is initialised false
 * and updated when phase-004 writes the preference.
 */
import { setPreference } from '$lib/preferences.js';

export const ONBOARDING_STEPS = [
  'welcome',
  'local-first',
  'storage',
  'backup',
  'ai-key',
  'create-project',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export class OnboardingStore {
  currentStep = $state<number>(0);
  completed   = $state<boolean>(false);

  get stepId(): OnboardingStep { return ONBOARDING_STEPS[this.currentStep]; }
  get isFirst(): boolean       { return this.currentStep === 0; }
  get isLast(): boolean        { return this.currentStep === ONBOARDING_STEPS.length - 1; }

  next():     void { if (!this.isLast)  this.currentStep += 1; }
  prev():     void { if (!this.isFirst) this.currentStep -= 1; }
  skipToEnd(): void { this.currentStep = ONBOARDING_STEPS.length - 1; }

  async complete(): Promise<void> {
    await setPreference('app.onboarding.completed', true);
    this.completed = true;
  }
}

export const onboarding = new OnboardingStore();
```

Create `src/routes/onboarding/+page.svelte` (thin shell that imports `OnboardingShell`):

```svelte
<script lang="ts">
  import OnboardingShell from './OnboardingShell.svelte';
</script>

<OnboardingShell />
```

In `src/hooks.server.ts`, add after the existing security checks and before the final `return resolve(event)` call. Import the server-side preference reader following the pattern in `src/routes/api/db/preferences/[key]/+server.ts`. If no server-side standalone reader exists, extract one to `src/lib/server/db/preference-reader.ts` first:

```ts
// ── 5. Onboarding guard ──────────────────────────────────────────────────────
const { pathname } = event.url;
const isPageRequest = event.request.headers.get('accept')?.includes('text/html');
const isExempt =
  pathname.startsWith('/onboarding') ||
  pathname.startsWith('/api/') ||
  pathname.startsWith('/_app/') ||
  /\.[a-z0-9]+$/i.test(pathname); // static assets

if (isPageRequest && !isExempt) {
  const completed = await readPreference<boolean>('app.onboarding.completed', false);
  if (!completed) {
    return Response.redirect(new URL('/onboarding', event.url.origin), 302);
  }
}
```

Where `readPreference` is the server-side utility extracted or imported from the DB layer.

**Acceptance checklist:**

- [ ] `onboarding.next()` increments `currentStep` by 1; does not exceed last index.
- [ ] `onboarding.prev()` decrements `currentStep`; does not go below 0.
- [ ] `onboarding.skipToEnd()` sets `currentStep` to `ONBOARDING_STEPS.length - 1`.
- [ ] `onboarding.complete()` calls `setPreference('app.onboarding.completed', true)` and sets `completed = true`.
- [ ] `hooks.server.ts` guard redirects unauthenticated page requests to `/onboarding`.
- [ ] Guard does not redirect `/api/*`, `/onboarding`, or static asset requests.
- [ ] `pnpm run check` clean.

---

### Phase-002 — Step components

**Goal:** Implement the six onboarding step components, each self-contained and focused on a single concept. `AiKeyStep` is explicitly skippable.

**Files:**

- `src/routes/onboarding/steps/WelcomeStep.svelte` — new.
- `src/routes/onboarding/steps/LocalFirstStep.svelte` — new.
- `src/routes/onboarding/steps/StorageStep.svelte` — new.
- `src/routes/onboarding/steps/BackupStep.svelte` — new.
- `src/routes/onboarding/steps/AiKeyStep.svelte` — new (skippable).
- `src/routes/onboarding/steps/CreateProjectStep.svelte` — new.

**Implementation:**

Each step component has the interface:

```svelte
<script lang="ts">
  interface Props {
    onNext: () => void;
    onSkip?: () => void; // AiKeyStep only
  }
  let { onNext, onSkip }: Props = $props();
</script>
```

Steps render using existing primitives only (`PrimaryButton`, `GhostButton`, `SecondaryButton` from `$lib/components/ui/`). No new CSS classes beyond local scoped styles.

**WelcomeStep.svelte** — headline "Welcome to Novellum", two-sentence description of what the app is, `onNext` button labeled "Get started".

**LocalFirstStep.svelte** — explains local-first: "Your stories live on your device. Nothing is sent to our servers." Bullet list: private by default, no account required, you own your files. `onNext` button labeled "Got it".

**StorageStep.svelte** — shows the storage location path from `GET /api/settings/storage-location`. If unavailable, shows a placeholder. `onNext` button labeled "Continue".

**BackupStep.svelte** — explains backup responsibility: "Novellum does not back up your work automatically. Export a `.novellum` backup regularly." Links to docs or Settings → Backup (use a `GhostButton` labeled "Open Backup Settings" that navigates to `/settings/backup` in a new route load). `onNext` button labeled "I understand".

**AiKeyStep.svelte** — text input for OpenRouter API key (uses `Input.svelte`), a "Save key" `PrimaryButton` that POSTs to the credential service endpoint. A `GhostButton` labeled "Skip for now" calls `onSkip`. On successful save, calls `onNext`. On error, shows inline error text (not a toast — inline paragraph with `role="alert"`).

**CreateProjectStep.svelte** — text input for project title (uses `Input.svelte`), a "Create project" `PrimaryButton`. On submit, POSTs to the project creation API (`POST /api/db/projects` or the projects API endpoint established in plan-018 stage-001). On success, calls `onboarding.complete()` then navigates to `/`.

**Acceptance checklist:**

- [ ] All six step files exist under `src/routes/onboarding/steps/`.
- [ ] Each step only imports from `$lib/components/ui/` and SvelteKit builtins (no route-local primitive duplication).
- [ ] `AiKeyStep` renders a Skip button that calls `onSkip` prop.
- [ ] `AiKeyStep` Skip works without a key being saved (no API call on skip).
- [ ] `CreateProjectStep` calls `onboarding.complete()` before navigating.
- [ ] `StorageStep` renders without error even if the storage API returns 4xx (graceful fallback text).

---

### Phase-003 — Onboarding shell

**Goal:** Orchestrate the six steps in a centered, branded shell with step-progress indicators, prev/next/skip navigation, and clean transitions between steps.

**Files:**

- `src/routes/onboarding/OnboardingShell.svelte` — new file.
- `src/routes/onboarding/StepDots.svelte` — new file (placeholder for `Stepper` from stage-008).

**Implementation:**

Create `src/routes/onboarding/StepDots.svelte`:

```svelte
<!-- TODO: replace with <Stepper> from src/lib/components/ui/Stepper.svelte once stage-008 ships. -->
<script lang="ts">
  interface Props { steps: number; current: number; }
  let { steps, current }: Props = $props();
</script>

<div class="step-dots" role="tablist" aria-label="Onboarding progress">
  {#each Array(steps) as _, i}
    <span
      class="step-dot"
      class:step-dot--active={i === current}
      class:step-dot--done={i < current}
      role="tab"
      aria-selected={i === current}
      aria-label="Step {i + 1} of {steps}"
    ></span>
  {/each}
</div>

<style>
  .step-dots        { display: flex; gap: var(--space-2); align-items: center; }
  .step-dot         { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); transition: background var(--duration-fast); }
  .step-dot--active { background: var(--color-accent); }
  .step-dot--done   { background: var(--color-accent-muted, var(--color-accent)); opacity: 0.5; }
</style>
```

Create `src/routes/onboarding/OnboardingShell.svelte`. It imports all step components and renders the active one via a `{#if}` chain (not dynamic imports, to keep SSR simple):

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { onboarding, ONBOARDING_STEPS } from '$lib/stores/onboarding.svelte.js';
  import StepDots from './StepDots.svelte';
  import WelcomeStep        from './steps/WelcomeStep.svelte';
  import LocalFirstStep     from './steps/LocalFirstStep.svelte';
  import StorageStep        from './steps/StorageStep.svelte';
  import BackupStep         from './steps/BackupStep.svelte';
  import AiKeyStep          from './steps/AiKeyStep.svelte';
  import CreateProjectStep  from './steps/CreateProjectStep.svelte';

  const stepId      = $derived(onboarding.stepId);
  const currentStep = $derived(onboarding.currentStep);
  const isFirst     = $derived(onboarding.isFirst);
  const isLast      = $derived(onboarding.isLast);

  function handleNext()    { onboarding.next(); }
  function handlePrev()    { onboarding.prev(); }
  function handleSkipToEnd(){ onboarding.skipToEnd(); }
</script>

<div class="onboarding-shell">
  <div class="onboarding-card">
    <StepDots steps={ONBOARDING_STEPS.length} current={currentStep} />

    <div class="onboarding-step">
      {#if stepId === 'welcome'}
        <WelcomeStep     onNext={handleNext} />
      {:else if stepId === 'local-first'}
        <LocalFirstStep  onNext={handleNext} />
      {:else if stepId === 'storage'}
        <StorageStep     onNext={handleNext} />
      {:else if stepId === 'backup'}
        <BackupStep      onNext={handleNext} />
      {:else if stepId === 'ai-key'}
        <AiKeyStep       onNext={handleNext} onSkip={handleSkipToEnd} />
      {:else if stepId === 'create-project'}
        <CreateProjectStep onNext={() => goto('/')} />
      {/if}
    </div>

    <div class="onboarding-nav">
      {#if !isFirst}
        <button class="nav-btn nav-btn--prev" onclick={handlePrev}>← Back</button>
      {/if}
      {#if !isLast && stepId !== 'ai-key'}
        <button class="nav-btn nav-btn--skip" onclick={handleSkipToEnd}>Skip setup</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .onboarding-shell {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: var(--color-surface-ground);
  }
  .onboarding-card {
    width: 100%; max-width: 480px;
    padding: var(--space-8);
    background: var(--color-surface-base);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    display: flex; flex-direction: column; gap: var(--space-6);
  }
  .onboarding-nav { display: flex; justify-content: space-between; }
  .nav-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: var(--text-sm); }
</style>
```

**Acceptance checklist:**

- [ ] All six steps render in the shell without TypeScript errors.
- [ ] `StepDots` shows correct active dot for each step index.
- [ ] "Back" button only appears when `currentStep > 0`.
- [ ] "Skip setup" button does not appear on `ai-key` step (that step has its own `onSkip`).
- [ ] `StepDots` has `// TODO: replace with <Stepper>` comment.

---

### Phase-004 — Completion flag

**Goal:** Write the completion preference to SQLite on the final step, trigger navigation to `/`, and ensure the `hooks.server.ts` guard correctly bypasses the redirect for returning users.

**Files:**

- `src/routes/onboarding/steps/CreateProjectStep.svelte` — call `onboarding.complete()` on success (already specced in phase-002; verify it's correct).
- No additional files needed — this phase is an integration verification pass.

**Implementation:**

`CreateProjectStep.svelte` success handler (already in phase-002 spec):

```ts
async function handleCreate() {
  // ... create project via API ...
  await onboarding.complete(); // writes app.onboarding.completed = true to SQLite
  await goto('/');
}
```

Integration check: after `complete()`, a page reload triggers `hooks.server.ts`. Verify via test that the guard reads the newly-written preference and does not redirect.

Write the end-to-end test in `tests/onboarding/onboarding-flow.test.ts`:

```ts
describe('onboarding guard', () => {
  it('redirects to /onboarding when app.onboarding.completed is absent', async () => { /* ... */ });
  it('does not redirect when app.onboarding.completed is true', async () => { /* ... */ });
});

describe('AiKeyStep', () => {
  it('skip button advances to CreateProjectStep without saving a key', async () => { /* ... */ });
});
```

**Acceptance checklist:**

- [ ] `onboarding.complete()` calls `setPreference('app.onboarding.completed', true)`.
- [ ] After `complete()`, navigation goes to `/`.
- [ ] `hooks.server.ts` guard does not redirect when `app.onboarding.completed === true` in SQLite.
- [ ] `pnpm run test` passes (all three test cases above).
- [ ] `pnpm run lint` clean; no `eslint-plugin-boundaries` violations.

---

## Out of Scope

- Sample project auto-creation or sample-novel fixture (post-V1 nice-to-have).
- Animated step transitions beyond CSS (post-V1).
- `GET /api/onboarding/status` and `POST /api/onboarding/complete` API routes (preference is read/written directly; no dedicated onboarding API needed for V1).
- `src/modules/onboarding/` module (all logic lives in the route and `$lib/stores` to avoid premature modularisation).
- Re-onboarding or "reset tutorial" flow (post-V1).
