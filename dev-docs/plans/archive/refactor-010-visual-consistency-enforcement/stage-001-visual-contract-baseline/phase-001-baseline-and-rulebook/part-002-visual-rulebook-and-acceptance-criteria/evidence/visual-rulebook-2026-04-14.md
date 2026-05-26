# Visual Rulebook and Acceptance Criteria

> Enforceable visual consistency rules for all Novellum UI surfaces.
> Date: 2026-04-14

## 1. Token Usage Rules

### RULE-T1: No Hardcoded Colors

**Policy**: Every color value in `<style>` blocks and inline styles MUST reference a `--color-*` token.

- **PASS**: `color: var(--color-text-primary)`
- **FAIL**: `color: #e5e5e5`
- **Check**: Grep for hex colors (`#[0-9a-fA-F]{3,8}`) in `.svelte` `<style>` blocks

### RULE-T2: Spacing Token Usage

**Policy**: All margin, padding, and gap values MUST use `--space-*` tokens. Exceptions: `0`, `auto`, `calc()` expressions involving tokens, and incidental layout values (border-width, progress-bar height, micro-animations).

- **PASS**: `padding: var(--space-4)`
- **PASS**: `margin: 0 auto`
- **PASS**: `gap: var(--space-5)`
- **FAIL**: `padding: 5px 10px`
- **Exception**: `translateX(4px)` for micro-animations is permitted
- **Exception**: `height: 6px` for progress tracks is permitted

### RULE-T3: Typography Token Usage

**Policy**: Font sizes MUST use `--text-*` tokens. Font weights MUST use `--font-weight-*` tokens. Font families MUST use `--font-sans`, `--font-display`, or `--font-mono`.

- **PASS**: `font-size: var(--text-sm)`
- **FAIL**: `font-size: 14px`
- **PASS**: `font-weight: var(--font-weight-semibold)`
- **FAIL**: `font-weight: 600`

### RULE-T4: Border and Radius Token Usage

**Policy**: Border colors MUST use `--color-border-*` tokens. Border radii MUST use `--radius-*` tokens. Border widths of `1px` and `2px` are acceptable as literals matching `--border-width-sm` and `--border-width-md`.

### RULE-T5: Shadow Token Usage

**Policy**: Box shadows MUST use `--shadow-*` tokens.

- **PASS**: `box-shadow: var(--shadow-sm)`
- **FAIL**: `box-shadow: 0 2px 4px rgba(0,0,0,0.5)`

### RULE-T6: Motion Token Usage

**Policy**: Transitions and animations MUST use `--duration-*` and `--ease-*` tokens.

- **PASS**: `transition: opacity var(--duration-base) var(--ease-standard)`
- **FAIL**: `transition: opacity 150ms ease`

## 2. Primitive Usage Rules

### RULE-P1: Page Container Pattern

**Policy**: Every top-level page content area must use a consistent container pattern with `max-width` and centered margins. Approved widths:

| Context | Max-Width | Token/Rationale |
| --- | --- | --- |
| Library pages | 1100px | Standard content width |
| Project pages | 1000px | Project shell standard |
| Reader pages | 880px | Intentionally narrow for reading |
| Settings | 1200px | Wider for grid settings |
| Editor | Full-width 3-col grid | Specialized panel layout |

**Check**: Verify each page uses its family's approved width.

### RULE-P2: Section Headers

**Policy**: Pages with title + description + optional actions SHOULD use the `SectionHeader` component.

- **Compliant**: `/books` (uses SectionHeader)
- **Exception**: `/` (hero landing — editorial exemption)
- **Exception**: Project hub (uses ProjectHubHero — complex hero)

### RULE-P3: Card Usage

**Policy**: Content cards SHOULD use the `SurfaceCard` component with the appropriate variant (`elevated`, `flat`, `inset`). Custom card components are acceptable ONLY when they require complex internal layout that SurfaceCard cannot accommodate (e.g., the hub dashboard metric cards).

### RULE-P4: Empty States

**Policy**: Empty collection states MUST use `EmptyStatePanel` with a descriptive title, optional description, and action button.

### RULE-P5: Button Primitives

**Policy**: Interactive buttons MUST use `PrimaryButton`, `GhostButton`, or `DestructiveButton`. No custom button styling.

- Already compliant across all surveyed surfaces.

### RULE-P6: Tab Navigation (Future)

**Policy**: When a TabNavigation primitive is created, all tabbed interfaces (continuity, etc.) must adopt it. Until then, custom tab-bar styling must use token-based values.

## 3. Shell and Layout Rules

### RULE-L1: Root Shell Integrity

**Policy**: The root layout (`+layout.svelte`) provides the `AppSidebar` + `.main-content` shell. No page may duplicate sidebar or shell chrome.

### RULE-L2: Project Shell Integrity

**Policy**: Project routes inherit the project layout (`/projects/[id]/+layout.svelte`) which provides `setContext('projectActions')`, modals, and view transitions. No project page may bypass this shell.

### RULE-L3: Content Padding

**Policy**: The `.main-content` area applies `padding: var(--panel-padding)` (16px). Pages should NOT add redundant outer padding.

### RULE-L4: Full-Height Layout

**Policy**: Pages that need full-viewport layouts (editor, workspace) may use `height: calc(100vh - ...)` to fill the available space. This is an intentional pattern, not a violation.

## 4. Navigation Rules

### RULE-N1: Active State Parity

**Policy**: The sidebar must correctly highlight the active route for every page in the app.

- Top-level items: exact `pathname` match
- Project mode items: `startsWith(href)` for deep-route support
- Already verified in refactor-009

### RULE-N2: Back Navigation

**Policy**: Detail pages within a collection MUST provide a back-link to the parent list. Format: `← [Parent Name]` using `--color-teal` link color.

### RULE-N3: SvelteKit Navigation

**Policy**: All navigation MUST use SvelteKit route APIs (`goto()`, `<a href>`, `redirect()`). No `window.location` usage.

## 5. Svelte 5 and Code Quality Rules

### RULE-S1: Svelte 5 Rune Compliance

**Policy**: All components must use Svelte 5 patterns exclusively:

- Props: `$props()` (never `export let`)
- Reactive: `$state`, `$derived`, `$effect` (never `$:`)
- Content: `{#snippet}` + `{@render}` (never `<slot />`)
- Events: `onclick={...}` (never `on:click`)

### RULE-S2: Module Boundaries

**Policy**: `eslint-plugin-boundaries` must pass. Route files may only import from `$lib/`, `$modules/`, `$app/`, and standard library.

## 6. Per-Surface Rule Mapping

Every surface in the registry is mapped to applicable rules below.

### Root Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-003 Root layout | L1, N1 |
| S-004 Root config | N/A (config only) |
| S-005 Error boundary | T1, T2, T3 |

### Library Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-001 Home | P1 (1100px), T1, T2, T3, T5, N1 |
| S-006 Books | P1 (1100px), P2, P4, P5, T1-T6, N1 |
| S-009 Stories | P1 (1100px), T1, T2, T3, N1 |

### Reader Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-007 Book detail | P1 (880px), T1, T2 (fix 5px 10px), T3, N2, N1 |

### Project Core Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-010 Project layout | L2, N1 |
| S-013 Hub | P1 (1000px), P3, T1-T6, N1 |
| S-015 Workspace | P1 (1000px), T1, T2, T3, L4, N1 |
| S-021 Outline | T1, T2, T3, L4, N1 |
| S-027 Arcs | P1 (420px), T1, T2, T3, N1 |
| S-028 Arc detail | P1 (420px), T1, T2, T3, N2, N1 |

### Editor Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-017 Editor list | L4, T1, T2, T3, P4, N1 |
| S-019 Scene detail | L4, T1, T2, T3, N1 |

### Analysis Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-023 Continuity | P6, T1, T2, T3, T4, N1 |
| S-025 Consistency | Redirect — no visual rules |

### Knowledge Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-031 Characters | P1, P4, P5, T1, T2, T3, N1, N2 |
| S-033 Character detail | T1, T2, T3, N2, N1 |
| S-035 Lore | P1, T1, T2, T3, N1 |
| S-037 Timeline | P1, T1, T2, T3, N1 |
| S-039 WB Characters | P1, P4, P5, T1, T2, T3, N1, N2 |
| S-043 WB Plot Threads | P1, P4, T1, T2, T3, N1 |
| S-046 WB Hub | P1, T1, T2, T3, N1 |

### Utility Surfaces

| Surface | Applicable Rules |
| --- | --- |
| S-047 Settings | P1 (1200px), T1, T2, T3, N1 |
| S-048 Migrate | T1, T2, T3 |
| S-049 Styles | Exempt (showcase) |
| S-051 Nova | T1, T2, T3, N1 |
| S-053 Images | P1 (1100px), T1, T2, T3, N1 |

## 7. Acceptance Checks (Automated)

| Check ID | Rule | Method | Failcase |
| --- | --- | --- | --- |
| AC-01 | T1 | grep for hex colors in .svelte style blocks | Any match |
| AC-02 | T2 | grep for `[0-9]+px` not inside `var()` or max-width/media | Match outside approved exceptions |
| AC-03 | T3 | grep for bare font-size/weight/family literals | Any match |
| AC-04 | S1 | grep for `export let`, `$:`, `<slot`, `on:click` | Any match |
| AC-05 | S2 | `pnpm run lint` (eslint-plugin-boundaries) | Exit non-zero |
| AC-06 | all | `pnpm run check` | Exit non-zero |
| AC-07 | all | `pnpm run test` | Exit non-zero |

## 8. Acceptance Checks (Manual)

| Check ID | Rule | Method |
| --- | --- | --- |
| MC-01 | P1 | Verify each page uses approved max-width |
| MC-02 | P2 | Verify SectionHeader usage where applicable |
| MC-03 | P4 | Verify EmptyStatePanel on empty collections |
| MC-04 | N1 | Navigate every route, verify sidebar active state |
| MC-05 | N2 | Verify back-links on detail pages |
| MC-06 | L1, L2 | Verify no shell duplication |
