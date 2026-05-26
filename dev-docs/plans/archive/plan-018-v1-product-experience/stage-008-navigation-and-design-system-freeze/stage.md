---
title: Navigation and Design-System Freeze
slug: stage-008-navigation-and-design-system-freeze
stage_number: 8
status: complete
owner: Architect Agent + Stylist Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-navigation-ia
  - phase-002-new-primitives
  - phase-003-enforcement-sweep
  - phase-004-token-audit
estimated_duration: 4d
risk_level: medium
---

## Goal

Reorganise the project-level sidebar to a writing-first IA (Hub → Editor → Outline → Worldbuilding → AI → Export → Settings) and freeze the design system: add five missing shared primitives to `src/lib/components/ui/`, sweep stages 001–004 files to replace inline patterns, and fix all hardcoded token violations. After this stage lands, no new route-local custom primitives are accepted in plan-018.

## Context (already in tree — do not duplicate)

- `src/lib/components/ActiveProjectSection.svelte` — project-scoped sidebar items. Current order and items: Hub, Editor, World Building, Continuity, Outline. No AI or Export items. Labels and order do not match the target IA.
- `src/lib/components/SidebarItem.svelte` — individual sidebar item; takes `href`, `label`, `active` props and an `icon` snippet.
- `src/lib/components/ui/` — existing primitives: `PrimaryButton`, `GhostButton`, `SecondaryButton`, `DestructiveButton`, `SurfaceCard`, `SurfacePanel`, `EmptyStatePanel`, `Input`, `PageHeader`, `SectionHeader`, `PillNav`, `PillToolbar`, `WorkspaceHero`, `WorkspaceInspector`, `WorkspaceShell`, `EntityDetailHeader`, `EntityHeaderPhoto`. Missing: `ErrorNotice`, `StatusBadge`, `ConfirmDialog`, `Stepper`, `MetadataRow`.
- `src/lib/components/ui/index.ts` — barrel export; update with each new primitive added.
- `src/routes/projects/[id]/` — no `/nova` sub-route exists. The AI nav item should link to `{base}/editor` for V1 (Nova panel is embedded in the editor); a dedicated `/nova` route is post-V1.
- `src/routes/projects/[id]/export` — does not exist as a dedicated route. For V1, the Export nav item should trigger the `openExport()` context action (established in `+layout.svelte`) rather than navigate to a route. Spec this as a `<button>` styled as a `SidebarItem` that calls `getContext('projectActions').openExport()`, not an `<a>` tag.
- Stage-005 delivers `NovaErrorBoundary.svelte` with a `// TODO: wire ErrorNotice` comment. This stage delivers `ErrorNotice.svelte` and wires it.
- Stage-006 delivers `StepDots.svelte` with a `// TODO: replace with <Stepper>` comment. This stage delivers `Stepper.svelte` and the swap is noted in the acceptance checklist (optional wire-up — out of scope if `StepDots` already works correctly).
- `scripts/check-visual-tokens.mjs` — referenced by `pnpm run check:tokens`. Run this to identify hardcoded pixel values.

## Entry Criteria

- plan-018 stages 001–005 complete (the surfaces that consume new primitives are stable).
- `pnpm run check` and `pnpm run lint` pass on the current tree before starting.

## Exit Criteria

- `ActiveProjectSection.svelte` nav order is: Hub, Editor, Outline, Worldbuilding, AI (button → `openExport`-style or editor link), Export (button → `openExport()`), Settings link to `/settings`. Continuity is removed from this section (moved or hidden). "World Building" renamed to "Worldbuilding".
- Five new primitives shipped under `src/lib/components/ui/` and exported from `index.ts`:
  - `ErrorNotice.svelte` — props `title: string`, `message: string`, `onRetry?: () => void`.
  - `StatusBadge.svelte` — props `variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'`, `label: string`.
  - `ConfirmDialog.svelte` — props `open: boolean`, `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`. Uses native `<dialog>` element.
  - `Stepper.svelte` — props `steps: string[]`, `currentStep: number`. Renders step dots/numbers.
  - `MetadataRow.svelte` — props `label: string`, `value: string`. Renders a label–value pair for metadata tables.
- `NovaErrorBoundary.svelte` (stage-005) wired to use `<ErrorNotice>` replacing the inline error markup. TODO comment removed.
- Enforcement sweep: inline card/button/error patterns in Hub, Export, and Settings pages from stages 001–004 are replaced with shared primitives. Evidence written to `dev-docs/audits/design-system-sweep-2026-05.md`.
- `pnpm run check:tokens` reports zero violations.
- `pnpm run test` passes (new primitive unit tests).
- `pnpm run check` clean.
- `pnpm run lint` clean.

## Phases

### Phase-001 — Navigation IA

**Goal:** Reorganise the project sidebar to the target IA. Add missing Export and AI items. Remove Continuity. Rename "World Building" → "Worldbuilding". Ensure order matches Hub → Editor → Outline → Worldbuilding → AI → Export → Settings.

**Files:**

- `src/lib/components/ActiveProjectSection.svelte` — reorder, rename, add, remove items.

**Implementation:**

Replace the `<SidebarSection>` contents in `ActiveProjectSection.svelte` with the following item set and order. Use the existing SVG icon conventions (inline SVGs already in the file for Hub/Editor/World Building/Continuity/Outline).

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  // ... existing imports ...

  // Export action from project layout context
  const projectActions = $derived.by(() => {
    try { return getContext<{ openExport: () => void }>('projectActions'); }
    catch { return null; }
  });
</script>

<!-- Inside the {#if base} block, replace SidebarSection contents: -->

<!-- 1. Hub -->
<SidebarItem href={base} label="Hub">
  {#snippet icon()}<!-- grid icon -->{/snippet}
</SidebarItem>

<!-- 2. Editor -->
<SidebarItem href="{base}/editor" label="Editor">
  {#snippet icon()}<!-- pencil icon -->{/snippet}
</SidebarItem>

<!-- 3. Outline -->
<SidebarItem href="{base}/outline" label="Outline">
  {#snippet icon()}<!-- document icon -->{/snippet}
</SidebarItem>

<!-- 4. Worldbuilding (renamed from "World Building") -->
<SidebarItem href="{base}/world-building" label="Worldbuilding">
  {#snippet icon()}<!-- globe icon -->{/snippet}
</SidebarItem>

<!-- 5. AI — links to editor (Nova panel is embedded; dedicated /nova route is post-V1) -->
<SidebarItem href="{base}/editor" label="AI">
  {#snippet icon()}<!-- sparkle/AI icon -->{/snippet}
</SidebarItem>

<!-- 6. Export — triggers modal via context action, not a route link -->
{#if projectActions}
  <button class="sidebar-action-item" onclick={projectActions.openExport} aria-label="Export project">
    <!-- export icon + "Export" label, styled to match SidebarItem visually -->
    Export
  </button>
{/if}

<!-- 7. Settings (project-scoped; links to /settings) -->
<SidebarItem href="/settings" label="Settings">
  {#snippet icon()}<!-- gear icon -->{/snippet}
</SidebarItem>
```

Style `.sidebar-action-item` to match `SidebarItem`'s visual style (copy its CSS class or apply the same token variables). Do not duplicate `SidebarItem`'s Svelte component for a button — use a `<button>` with matching styles.

Continuity (`{base}/continuity`) is removed. If a "Continuity" link is needed in V1, it should be discoverable from the AI section or Hub, not the primary sidebar. Log this decision in the phase implementation log.

**Acceptance checklist:**

- [ ] Sidebar order is exactly: Hub, Editor, Outline, Worldbuilding, AI, Export, Settings.
- [ ] "World Building" label is replaced with "Worldbuilding".
- [ ] "Continuity" item is absent.
- [ ] Export button calls `projectActions.openExport()`.
- [ ] AI item links to `{base}/editor`.
- [ ] Settings links to `/settings`.
- [ ] `pnpm run check` clean.

---

### Phase-002 — New primitives

**Goal:** Implement five missing shared primitives in `src/lib/components/ui/` and export them from `index.ts`. Each must be Svelte 5, type-safe, and accessible.

**Files:**

- `src/lib/components/ui/ErrorNotice.svelte` — new.
- `src/lib/components/ui/StatusBadge.svelte` — new.
- `src/lib/components/ui/ConfirmDialog.svelte` — new.
- `src/lib/components/ui/Stepper.svelte` — new.
- `src/lib/components/ui/MetadataRow.svelte` — new.
- `src/lib/components/ui/index.ts` — add five exports.

**Implementation:**

**`ErrorNotice.svelte`:**

```svelte
<script lang="ts">
  interface Props {
    title:    string;
    message:  string;
    onRetry?: () => void;
  }
  let { title, message, onRetry }: Props = $props();
</script>

<div class="error-notice" role="alert">
  <svg class="error-notice__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
  <div class="error-notice__body">
    <strong class="error-notice__title">{title}</strong>
    <p class="error-notice__message">{message}</p>
  </div>
  {#if onRetry}
    <button class="error-notice__retry" onclick={onRetry}>Retry</button>
  {/if}
</div>

<style>
  .error-notice {
    display: flex; align-items: flex-start; gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-status-error-bg, hsl(0 60% 96%));
    color:      var(--color-status-error,    hsl(0 60% 35%));
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }
  .error-notice__icon    { flex-shrink: 0; margin-top: 2px; }
  .error-notice__body    { flex: 1; }
  .error-notice__title   { display: block; font-weight: var(--font-weight-semibold); margin-bottom: var(--space-1); }
  .error-notice__message { margin: 0; }
  .error-notice__retry   { background: none; border: 1px solid currentColor; border-radius: var(--radius-sm); padding: var(--space-1) var(--space-2); cursor: pointer; font-size: var(--text-xs); flex-shrink: 0; color: inherit; }
</style>
```

**`StatusBadge.svelte`:**

```svelte
<script lang="ts">
  type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
  interface Props { variant: Variant; label: string; }
  let { variant, label }: Props = $props();
</script>

<span class="status-badge status-badge--{variant}">{label}</span>

<style>
  .status-badge {
    display: inline-flex; align-items: center;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }
  .status-badge--success { background: hsl(140 50% 90%); color: hsl(140 50% 25%); }
  .status-badge--warning { background: hsl(40  80% 90%); color: hsl(40  80% 25%); }
  .status-badge--error   { background: hsl(0   60% 92%); color: hsl(0   60% 30%); }
  .status-badge--info    { background: hsl(210 60% 90%); color: hsl(210 60% 25%); }
  .status-badge--neutral { background: var(--color-surface-raised); color: var(--color-text-muted); }
</style>
```

**`ConfirmDialog.svelte`:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    open:      boolean;
    title:     string;
    message:   string;
    onConfirm: () => void;
    onCancel:  () => void;
    confirmLabel?: string;
    cancelLabel?:  string;
  }
  let {
    open, title, message,
    onConfirm, onCancel,
    confirmLabel = 'Confirm',
    cancelLabel  = 'Cancel',
  }: Props = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);

  $effect(() => {
    if (!dialogEl) return;
    if (open) dialogEl.showModal();
    else dialogEl.close();
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialogEl}
  class="confirm-dialog"
  onclose={onCancel}
>
  <h2 class="confirm-dialog__title">{title}</h2>
  <p  class="confirm-dialog__message">{message}</p>
  <div class="confirm-dialog__actions">
    <button class="confirm-dialog__btn confirm-dialog__btn--cancel"  onclick={onCancel}>{cancelLabel}</button>
    <button class="confirm-dialog__btn confirm-dialog__btn--confirm" onclick={onConfirm}>{confirmLabel}</button>
  </div>
</dialog>

<style>
  .confirm-dialog {
    padding: var(--space-6); border-radius: var(--radius-lg);
    border: 1px solid var(--color-border); max-width: 400px; width: 90vw;
    background: var(--color-surface-base);
  }
  .confirm-dialog::backdrop { background: hsl(0 0% 0% / 0.4); }
  .confirm-dialog__title   { font-size: var(--text-lg); font-weight: var(--font-weight-semibold); margin: 0 0 var(--space-2); }
  .confirm-dialog__message { color: var(--color-text-secondary); margin: 0 0 var(--space-6); }
  .confirm-dialog__actions { display: flex; justify-content: flex-end; gap: var(--space-2); }
  .confirm-dialog__btn     { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); border: 1px solid var(--color-border); background: none; }
  .confirm-dialog__btn--confirm { background: var(--color-accent); color: var(--color-on-accent, #fff); border-color: var(--color-accent); }
</style>
```

**`Stepper.svelte`:**

```svelte
<script lang="ts">
  interface Props { steps: string[]; currentStep: number; }
  let { steps, currentStep }: Props = $props();
</script>

<div class="stepper" role="tablist" aria-label="Progress">
  {#each steps as step, i}
    <div
      class="stepper__step"
      class:stepper__step--active={i === currentStep}
      class:stepper__step--done={i < currentStep}
      role="tab"
      aria-selected={i === currentStep}
      aria-label="{step} (step {i + 1} of {steps.length})"
    >
      <span class="stepper__dot"></span>
      <span class="stepper__label">{step}</span>
    </div>
    {#if i < steps.length - 1}
      <span class="stepper__connector" aria-hidden="true"></span>
    {/if}
  {/each}
</div>

<style>
  .stepper { display: flex; align-items: center; gap: 0; }
  .stepper__step     { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
  .stepper__dot      { width: 10px; height: 10px; border-radius: 50%; background: var(--color-border); transition: background var(--duration-fast); }
  .stepper__label    { font-size: var(--text-2xs, 0.625rem); color: var(--color-text-muted); white-space: nowrap; }
  .stepper__step--active .stepper__dot { background: var(--color-accent); }
  .stepper__step--done   .stepper__dot { background: var(--color-accent); opacity: 0.55; }
  .stepper__connector    { flex: 1; height: 1px; min-width: var(--space-3); background: var(--color-border); margin-bottom: calc(var(--space-1) + 0.625rem); }
</style>
```

**`MetadataRow.svelte`:**

```svelte
<script lang="ts">
  interface Props { label: string; value: string; }
  let { label, value }: Props = $props();
</script>

<div class="metadata-row">
  <span class="metadata-row__label">{label}</span>
  <span class="metadata-row__value">{value}</span>
</div>

<style>
  .metadata-row { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
  .metadata-row__label { color: var(--color-text-muted); font-size: var(--text-sm); flex-shrink: 0; }
  .metadata-row__value { color: var(--color-text-primary); font-size: var(--text-sm); text-align: right; }
</style>
```

Add all five to `src/lib/components/ui/index.ts`:

```ts
export { default as ErrorNotice   } from './ErrorNotice.svelte';
export { default as StatusBadge   } from './StatusBadge.svelte';
export { default as ConfirmDialog } from './ConfirmDialog.svelte';
export { default as Stepper       } from './Stepper.svelte';
export { default as MetadataRow   } from './MetadataRow.svelte';
```

**Acceptance checklist:**

- [ ] All five components exist in `src/lib/components/ui/`.
- [ ] All five are exported from `index.ts`.
- [ ] `ErrorNotice` renders with required props; `onRetry` button only renders when the prop is provided.
- [ ] `StatusBadge` renders correct background for each variant.
- [ ] `ConfirmDialog` shows when `open = true`; triggers `onCancel` on backdrop click or `<dialog>` `close` event.
- [ ] `Stepper` renders one `.stepper__step` per entry in `steps[]`.
- [ ] `MetadataRow` renders `label` and `value` in separate spans.
- [ ] `pnpm run check` clean.

---

### Phase-003 — Enforcement sweep

**Goal:** Replace inline card, button, and error patterns introduced in stages 001–004 with the new shared primitives. Produce a written sweep evidence document.

**Files:**

- Hub, Export, Settings page/component files from stages 001–004 — edit to use primitives.
- `src/modules/nova/components/NovaErrorBoundary.svelte` — replace inline error markup with `<ErrorNotice>`.
- `dev-docs/audits/design-system-sweep-2026-05.md` — new file.

**Implementation:**

1. **Wire `ErrorNotice` into `NovaErrorBoundary`** (stage-005 delivered a TODO comment):

Remove the inline `.nova-error` markup and replace with:

```svelte
import ErrorNotice from '$lib/components/ui/ErrorNotice.svelte';

{#if errorCopy}
  <ErrorNotice title={errorCopy.title} message={errorCopy.message} />
{/if}
```

Remove the `// TODO: wire ErrorNotice from stage-008` comment.

2. **Sweep Hub, Export, Settings files:** For each file that has inline error `<div role="alert">` blocks, status indicator `<span>` elements with hardcoded colours, or ad-hoc confirm dialogs, replace with `ErrorNotice`, `StatusBadge`, and `ConfirmDialog` respectively. The goal is to eliminate route-local duplication, not to redesign pages.

3. **Create sweep evidence:** `dev-docs/audits/design-system-sweep-2026-05.md` lists every replaced instance:

```markdown
# Design System Sweep — 2026-05
| File | Pattern replaced | Primitive used |
|:-----|:----------------|:---------------|
| src/modules/nova/components/NovaErrorBoundary.svelte | inline .nova-error div | ErrorNotice |
| ... | ... | ... |
```

Mark any inline patterns that were intentionally kept (e.g. one-off layouts that don't justify a shared primitive) with a justification note.

**Acceptance checklist:**

- [ ] `NovaErrorBoundary.svelte` uses `<ErrorNotice>` with no inline error markup.
- [ ] TODO comment removed from `NovaErrorBoundary.svelte`.
- [ ] `dev-docs/audits/design-system-sweep-2026-05.md` exists and lists all replaced instances.
- [ ] No new route-local primitive duplication introduced during this sweep.
- [ ] `pnpm run check` clean after sweep edits.

---

### Phase-004 — Token audit

**Goal:** Eliminate all hardcoded pixel values in the codebase, achieving a clean `pnpm run check:tokens` run.

**Files:** Any files flagged by `pnpm run check:tokens` (determined at runtime).

**Implementation:**

Run `pnpm run check:tokens`. For each violation:

- Replace hardcoded `px` values with the closest design token from the established token scale (e.g. `8px` → `var(--space-2)`, `14px` → `var(--text-sm)`, `1px solid #ccc` → `1px solid var(--color-border)`).
- Do not introduce new arbitrary values — if no token maps cleanly, use the nearest token and note the decision in the phase implementation log.
- Focus on files changed in plan-018 stages 001–008. Do not expand scope to unrelated legacy files unless the violation count is small (≤5 total legacy violations).

After fixes, re-run `pnpm run check:tokens` and confirm zero violations before closing.

**Acceptance checklist:**

- [ ] `pnpm run check:tokens` reports zero violations.
- [ ] No new `px` literals in any file edited during stages 001–008.
- [ ] `pnpm run check` clean.
- [ ] `pnpm run lint` clean (`eslint-plugin-boundaries` passes; no module leakage introduced by primitive exports).

---

## Out of Scope

- Storybook story files for new primitives (explicitly post-V1 unless a dedicated Storybook stage is added).
- `SettingsSection`, `Toolbar`, `FileDropzone`, `SegmentedControl` primitives (from the stub's exit criteria — deferred; only the five primitives required by stages 005–008 consumers are shipped here).
- Dedicated `/projects/{id}/nova` route (Nova stays in the editor for V1; sidebar AI item links to editor).
- Dedicated `/projects/{id}/export` route (Export modal is triggered from the sidebar action button; a route is post-V1).
- Visual regression / Playwright snapshot tests (stage-012 QA pass owns those).
