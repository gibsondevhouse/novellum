---
title: Worldbuilding V1 Scope Audit
slug: stage-007-worldbuilding-scope-audit
stage_number: 7
status: complete
owner: Architect Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-surface-audit
  - phase-002-navigation-gating
  - phase-003-fix-pass
  - phase-004-feature-flag
estimated_duration: 5d
risk_level: medium
---

## Goal

Audit every visible worldbuilding surface against a V1 inclusion checklist. Gate non-conforming surfaces from primary navigation behind a `labs` feature flag. Make quick structural fixes for "fix" surfaces (add missing SQLite tables, ensure backup inclusion, align layout). Ship a `labs: boolean` feature flag backed by a user preference so labs surfaces can be previewed without a code change.

## Context (already in tree — do not duplicate)

- `src/routes/projects/[id]/world-building/` — worldbuilding index route. Sub-routes currently confirmed: `characters/`, `factions/`, `lineages/`, `locations/`, `lore/`, `plot-threads/`, `timeline/`.
- `src/routes/projects/[id]/arcs/` — exists as a separate route, not nested under world-building.
- `src/routes/projects/[id]/outline/` — acts, chapters, scenes are owned by the outline surface, not worldbuilding.
- `src/lib/components/ActiveProjectSection.svelte` — the project-scoped sidebar nav rendered inside `AppSidebar`. Currently shows: Hub, Editor, World Building, Continuity, Outline. The worldbuilding gating in phase-002 modifies this file.
- `src/modules/nova/services/feature-flags.ts` — module-local nova flag (`isNovaAgenticEnabled`). The new `labs` flag is a separate, app-global concern. Do not pollute the nova module. Create `src/lib/feature-flags.ts` instead.
- `dev-docs/audits/` — existing audit directory. The phase-001 artifact goes here.
- No `Story Bible` or `Scene Notes` routes exist under world-building. Enumerate them in the audit as missing.

## Entry Criteria

- plan-017 stage-002 complete: canonical SQLite schema established.
- plan-017 stage-004 complete: backup table registry exists.
- `pnpm run check` and `pnpm run lint` pass on the current tree before starting.

## Exit Criteria

- `dev-docs/audits/worldbuilding-v1-audit-2026-05.md` exists and contains the full audit table (columns: Surface, Route, SQLite table present, Backup included, AI context, Layout consistent, V1 Decision). Enumerates all surfaces including absent ones (Story Bible, Scene Notes, Arcs, Acts, Chapters marked as outline-owned).
- All "keep" surfaces pass the V1 checklist: SQLite persistence end-to-end, create/edit/delete works, project-scoped queries, included in backup, included in AI context where relevant, consistent layout, no fake fields, no dead ends.
- V1 minimum set ships conforming: Characters, Locations, Lore, Plot Threads, Timeline.
- "Labs" surfaces are hidden from the project sidebar when `labsEnabled === false` and shown with a "Labs" badge when `true`.
- "Hide" surfaces are removed from project nav entirely.
- `src/lib/feature-flags.ts` exports `labsEnabled: boolean` (`$state`) backed by `getPreference('app.labs.enabled', false)` with an `initLabsFlag()` async initialiser.
- A Labs toggle exists in `/settings/defaults` or `/settings/about` — a `<input type="checkbox">` (or the pattern established in those pages) writing `setPreference('app.labs.enabled', value)`.
- The backup table registry (plan-017 stage-004) is updated to reflect any new or removed tables from the fix pass.
- Tests pass:
  - `tests/settings/feature-flags.test.ts` — `labsEnabled` reads preference correctly; `initLabsFlag()` hydrates from SQLite; defaults to `false`.
  - `tests/worldbuilding/audit-completeness.test.ts` — audit doc exists at expected path and contains all required surface names (smoke test that the doc wasn't accidentally deleted).
- `pnpm run test` passes including new tests.
- `pnpm run check` clean.
- `pnpm run lint` clean.

## Phases

### Phase-001 — Surface audit

**Goal:** Produce a complete written audit of every worldbuilding surface, documenting each surface's technical health and assigning a V1 decision. This is the only phase that produces a documentation artifact rather than code.

**Files:**

- `dev-docs/audits/worldbuilding-v1-audit-2026-05.md` — new file.

**Implementation:**

Create `dev-docs/audits/worldbuilding-v1-audit-2026-05.md` with the following structure:

```markdown
# Worldbuilding V1 Surface Audit
**Date:** 2026-05  **Author:** Architect Agent  **Plan:** plan-018 stage-007

## V1 Inclusion Checklist (per surface)
A surface is **keep** only if ALL of the following are true:
- [ ] SQLite table exists and is project-scoped
- [ ] Create / edit / delete operations work end-to-end
- [ ] Included in `.novellum` backup via table registry
- [ ] Exposed to AI context where relevant
- [ ] Consistent layout (uses shared layout primitives)
- [ ] No fake/non-persisted fields visible to users
- [ ] No "coming soon" dead ends

## Surface Audit Table

| Surface       | Route                              | SQLite table    | Backup | AI context | Layout OK | V1 Decision |
|:--------------|:-----------------------------------|:----------------|:-------|:-----------|:----------|:------------|
| Characters    | world-building/characters          | `characters`    | ✓/✗   | ✓/✗        | ✓/✗       | keep/fix/labs/hide |
| Factions      | world-building/factions            | `factions`      | ?      | ?          | ?         | |
| Lineages      | world-building/lineages            | `lineages`      | ?      | ?          | ?         | |
| Locations     | world-building/locations           | `locations`     | ✓/✗   | ✓/✗        | ✓/✗       | |
| Lore          | world-building/lore                | `lore_entries`  | ✓/✗   | ✓/✗        | ✓/✗       | |
| Plot Threads  | world-building/plot-threads        | `plot_threads`  | ✓/✗   | ✓/✗        | ✓/✗       | |
| Timeline      | world-building/timeline            | `timeline_events` | ?   | ?          | ?         | |
| Arcs          | projects/[id]/arcs                 | `arcs`          | ?      | ?          | ?         | |
| Acts          | projects/[id]/outline (owned)      | `acts`          | ✓      | ✓          | ✓         | outline-owned |
| Chapters      | projects/[id]/outline (owned)      | `chapters`      | ✓      | ✓          | ✓         | outline-owned |
| Scene Notes   | — (does not exist)                 | —               | —      | —          | —         | hide |
| Story Bible   | — (does not exist)                 | —               | —      | —          | —         | labs |

## Decisions

| Decision | Meaning |
|:---------|:--------|
| `keep`   | Surface passes all checklist items. Ship as-is. |
| `fix`    | Surface has ≤2 structural gaps fixable in a half-day. Fix in phase-003. |
| `labs`   | Surface is incomplete but has a recovery path. Show only when labs flag is on. |
| `hide`   | Surface does not exist or has no viable recovery path. Remove from nav. |

## Follow-up Plans
- Post-V1 plan candidates for labs surfaces: ...
```

Fill in each `✓/✗` and decision cell by inspecting the actual codebase (SQLite schema files, backup table registry, `context-hooks.ts` inclusions, route components). Do not leave question marks in the final committed document.

**Acceptance checklist:**

- [ ] File exists at `dev-docs/audits/worldbuilding-v1-audit-2026-05.md`.
- [ ] All 12 surfaces are enumerated (including missing ones marked `hide` or `labs`).
- [ ] Every decision cell is filled (no `?` remaining).
- [ ] Acts/Chapters are marked `outline-owned` (not worldbuilding).
- [ ] Story Bible and Scene Notes are marked `hide` or `labs` with justification.

---

### Phase-002 — Navigation gating

**Goal:** Remove `labs`/`hide` worldbuilding surfaces from the project sidebar. Show `labs` surfaces with a "Labs" badge only when `labsEnabled === true`.

**Files:**

- `src/lib/components/ActiveProjectSection.svelte` — modify to gate surfaces.
- `src/lib/feature-flags.ts` — import `labsEnabled` (created in phase-004; implement a stub `false` constant here if phase-004 is not yet complete, and replace it when phase-004 lands).

**Implementation:**

Read the phase-001 audit decisions. For each surface assigned `labs`: wrap the corresponding `SidebarItem` in:

```svelte
{#if labsEnabled}
  <SidebarItem href="{base}/world-building/timeline" label="Timeline">
    {#snippet badge()}<span class="labs-badge">Labs</span>{/snippet}
    {#snippet icon()}<!-- icon svg -->{/snippet}
  </SidebarItem>
{/if}
```

If `SidebarItem` does not support a `badge` snippet, add a suffix to the `label` prop: `label={labsEnabled ? 'Timeline (Labs)' : ''}`.

For each surface assigned `hide`: remove the `SidebarItem` entry entirely.

Import pattern for the flag stub (replace with real import when phase-004 ships):

```ts
// TODO: replace stub with real import once phase-004 ships:
// import { labsEnabled } from '$lib/feature-flags.js';
const labsEnabled = false; // stub
```

Once `src/lib/feature-flags.ts` exists (phase-004), replace the stub with the real import.

Add a `.labs-badge` style in the `<style>` block:

```css
.labs-badge {
  font-size: var(--text-2xs, 0.625rem);
  background: var(--color-accent-muted, hsl(250 60% 85%));
  color: var(--color-accent-dark, hsl(250 60% 30%));
  border-radius: var(--radius-sm);
  padding: 1px var(--space-1);
  font-weight: var(--font-weight-medium);
}
```

**Acceptance checklist:**

- [ ] `hide` surfaces are absent from the sidebar regardless of flag value.
- [ ] `labs` surfaces are absent when `labsEnabled === false`.
- [ ] `labs` surfaces are visible with a "Labs" badge when `labsEnabled === true`.
- [ ] `keep` and `fix` surfaces are always visible.
- [ ] Stub comment `// TODO: replace stub` is present until phase-004 lands.

---

### Phase-003 — Fix pass

**Goal:** Make the minimal structural fixes required for surfaces assigned the `fix` decision: add missing SQLite tables, ensure backup table registry inclusion, apply the shared layout pattern. No deep feature work.

**Files:** Determined by audit decisions in phase-001. Common candidates:

- `src/lib/db/schema.sql` (or migration file) — add missing table DDL.
- `src/lib/server/db/backup-registry.ts` (or equivalent) — add table name to backup inclusion list.
- Route `+page.svelte` files for fix surfaces — apply `WorkspaceShell` or the shared layout wrapper.

**Implementation:**

For each surface with decision `fix`:

1. **If SQLite table missing:** add the CREATE TABLE statement to the migration/schema file. Follow the existing schema conventions (UUID primary keys, `project_id` foreign key, `created_at`/`updated_at` timestamps, no nullable required fields).

2. **If backup excluded:** add the table name to the backup table registry established in plan-017 stage-004.

3. **If layout inconsistent:** wrap the route's content in `WorkspaceShell` (from `$lib/components/ui/WorkspaceShell.svelte`) with appropriate `sidebarLabel` and `mainLabel` props, matching the pattern in `src/routes/projects/[id]/outline/+page.svelte`.

Do not add new UI features, search, filters, or relationships. Structural plumbing only.

After fixes, re-verify each `fix` surface against the V1 checklist and update `worldbuilding-v1-audit-2026-05.md` with the post-fix status (change decision to `keep` when confirmed passing).

**Acceptance checklist:**

- [ ] Every `fix` surface has a SQLite table after this phase.
- [ ] Every `fix` surface is included in the backup table registry.
- [ ] Every `fix` surface uses the shared layout pattern.
- [ ] Audit doc updated to reflect post-fix decisions.
- [ ] `pnpm run test` passes (no regressions in `tests/db/` or `tests/repositories/`).
- [ ] `pnpm run check` clean after schema changes.

---

### Phase-004 — Feature flag

**Goal:** Ship an app-global `labs` feature flag backed by a SQLite preference, and expose a Labs toggle in Settings so power users can preview experimental surfaces without a code change.

**Files:**

- `src/lib/feature-flags.ts` — new file.
- Settings route (`src/routes/settings/defaults/+page.svelte` or `src/routes/settings/about/+page.svelte`) — add Labs toggle.
- `src/lib/components/ActiveProjectSection.svelte` — replace stub import with real import.

**Implementation:**

Create `src/lib/feature-flags.ts`:

```ts
/**
 * plan-018 stage-007 phase-004 — App-global feature flags.
 *
 * `labsEnabled` controls visibility of experimental ("Labs") surfaces.
 * Backed by SQLite preference `app.labs.enabled` (default: false).
 * Call `initLabsFlag()` once on app startup (e.g. in root +layout.ts).
 */
import { getPreference, setPreference } from '$lib/preferences.js';

export let labsEnabled = $state<boolean>(false);

export async function initLabsFlag(): Promise<void> {
  const value = await getPreference<boolean>('app.labs.enabled', false);
  labsEnabled = value ?? false;
}

export async function setLabsEnabled(value: boolean): Promise<void> {
  labsEnabled = value;
  await setPreference('app.labs.enabled', value);
}
```

In the appropriate Settings page (prefer `src/routes/settings/defaults/+page.svelte` unless it already has an unrelated heavy edit in this plan cycle — in that case use `src/routes/settings/about/+page.svelte`), add a Labs section:

```svelte
<script lang="ts">
  import { labsEnabled, setLabsEnabled } from '$lib/feature-flags.js';
</script>

<section class="settings-section">
  <h2>Labs</h2>
  <label>
    <input
      type="checkbox"
      checked={labsEnabled}
      onchange={(e) => void setLabsEnabled((e.currentTarget as HTMLInputElement).checked)}
    />
    Enable experimental features
  </label>
  <p class="settings-hint">Labs features are unfinished and may change or disappear without notice.</p>
</section>
```

Call `initLabsFlag()` in the root `+layout.ts` `load` function (or in `onMount` in root `+layout.svelte`) so the flag is hydrated before any project route renders.

Replace the stub in `ActiveProjectSection.svelte` with the real import:

```ts
import { labsEnabled } from '$lib/feature-flags.js';
```

**Acceptance checklist:**

- [ ] `labsEnabled` defaults to `false` when preference is absent.
- [ ] `initLabsFlag()` sets `labsEnabled = true` when preference is `true`.
- [ ] `setLabsEnabled(true)` persists to SQLite and updates the reactive state.
- [ ] Labs toggle renders in Settings and persists across reloads.
- [ ] Stub removed from `ActiveProjectSection.svelte`.
- [ ] `pnpm run test` passes (`tests/settings/feature-flags.test.ts` covers the three flag cases).
- [ ] `eslint-plugin-boundaries` clean: `src/lib/feature-flags.ts` is a `$lib` module, not a module-specific file — no boundary violations.

---

## Out of Scope

- Deep feature implementation for labs surfaces (Characters relationship graph, Timeline visualisation, Story Bible editor — post-V1 plans).
- Worldbuilding search, filtering, or cross-linking between surfaces.
- Acts/Chapters/Scenes surface work (owned by the Outline module; not worldbuilding).
- Removing the `continuity` route from the sidebar (that is stage-008 phase-001's responsibility).
