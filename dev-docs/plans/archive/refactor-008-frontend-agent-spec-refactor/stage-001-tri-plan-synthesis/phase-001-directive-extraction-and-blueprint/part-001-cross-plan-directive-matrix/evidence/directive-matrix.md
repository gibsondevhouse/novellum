# Cross-Plan Directive Matrix

> Extracted from refactor-006, refactor-007, and linearization-overhaul.
> Priority: safety/production-readiness > surface consistency > stylistic/system refinements.

## 1. Architecture & Module Boundaries

| Directive | Source | Priority | Notes |
|---|---|---|---|
| SvelteKit conventions strictly (routing, layouts, form actions, state) | R-006, Lin | **Non-negotiable** | Already in baseline |
| Svelte 5 runes only (`$state`, `$derived`, `$effect`, `$props()`) | Lin, R-006 | **Non-negotiable** | Lin mandated full migration; R-006 required for new code |
| No `export let`, no `$:`, no `<slot />` | Lin | **Non-negotiable** | Enforce `{#snippet}` + `{@render}` |
| Extract heavy state into `.svelte.ts` classes | Lin | **Non-negotiable** | Universal reactivity + testability |
| Modular boundaries enforced via `eslint-plugin-boundaries` | R-006, R-007 | **Non-negotiable** | Zero violations required |
| No cross-module internal imports | R-006 | **Non-negotiable** | Only public `index.ts` API |
| Routes are thin orchestrators (≤80 lines warning, 150 hard) | Boundaries doc | **Non-negotiable** | File-length governance |
| Components ≤150 lines (250 hard) | Boundaries doc | Hard policy | Decomposition trigger |
| Services are pure TS (no Svelte state, no UI events) | Boundaries doc | Hard policy | — |
| TypeScript strict mode, no `any` | R-006 | **Non-negotiable** | XSS/type-safety hardening |
| `attribute-style` event listeners (`onclick={...}`) | Lin | Hard policy | — |

### Conflicts & Resolutions

- **None.** All three plans agree on Svelte 5, boundaries, and strict TS. Lin provides the most specific migration rules; R-006 provides the safety rationale. Merge both.

---

## 2. Surface Consistency & Route Cohesion

| Directive | Source | Priority | Notes |
|---|---|---|---|
| Shared project shell (masthead, mode switcher, content frame) | R-007, Lin | **Non-negotiable** | Shell contract persists across all routes |
| Content frame discipline (centered, constrained width, consistent padding) | R-007 | **Non-negotiable** | No left-heavy vs centered drift |
| Mode switcher: same treatment, placement, spacing across all routes | R-007 | Hard policy | — |
| Route-family continuity: all project routes feel like one product | R-007, Lin | **Non-negotiable** | Primary product rule |
| Empty states maintain full layout structure + forward momentum | R-007, R-006 | Hard policy | R-006 mandated EmptyStatePanel component |
| Breadcrumb navigation | R-006 | Implementation protocol | — |
| Route reachability: every surface navigable, no dead ends | R-007 | Hard policy | — |
| Hub, Outline, Editor, World Building, Consistency must feel like same app | Baseline + R-007 | **Non-negotiable** | Failure condition |

### Conflicts & Resolutions

- **R-007 route reachability vs. Lin's surface density:** No conflict — reachability is structural, density is visual. Both apply.

---

## 3. Design Tokens & Primitives

| Directive | Source | Priority | Notes |
|---|---|---|---|
| All spacing, color, typography, radii, borders via design tokens | R-006, R-007, Lin | **Non-negotiable** | No hardcoded values |
| Surface layers: base → ground → raised → overlay → elevated | Design System, Lin | Hard policy | Tonal layering |
| Borders use rgba tokens only (no opaque hex) | Design System | Hard policy | — |
| Typography via Inter, DM Serif Display, JetBrains Mono tokens | Design System | Hard policy | — |
| Motion via duration + easing tokens (80ms-320ms scale) | Lin, Design System | Implementation protocol | — |
| Primitive-first: use `SurfaceCard`, `SurfacePanel`, `SectionHeader`, `PrimaryButton`, `GhostButton` etc. | R-007, Lin | **Non-negotiable** | No raw HTML for standard patterns |
| All buttons use approved primitives (`PrimaryButton`, `GhostButton`, `DestructiveButton`) | R-006, R-007 | **Non-negotiable** | — |
| No hardcoded `rem`/`px` outside token definitions | R-006 | **Non-negotiable** | — |

### Conflicts & Resolutions

- **None.** All three plans converge on token-only styling and primitive reuse. Lin adds motion tokens; R-006/R-007 add the no-hardcoded enforcement.

---

## 4. Accessibility

| Directive | Source | Priority | Notes |
|---|---|---|---|
| All inputs must have labels | R-006, Baseline | **Non-negotiable** | — |
| Visible focus indicators | R-006 | **Non-negotiable** | — |
| Keyboard navigation must work for all interactive elements | R-006, Baseline | **Non-negotiable** | — |
| ARIA roles for collapsible sections, dialogs, complex widgets, tabs | R-006, Baseline | **Non-negotiable** | — |
| Form accessibility (proper association, error messaging) | R-006 | **Non-negotiable** | — |
| Focus management on route transitions and modal open/close | R-006 | Hard policy | — |
| Logical tab order preserved across shared navigation | R-006, Baseline | **Non-negotiable** | — |
| Sufficient contrast in dark theme | Baseline, Lin | **Non-negotiable** | — |

### Conflicts & Resolutions

- **None.** R-006 is the primary a11y source; baseline and Lin reinforce.

---

## 5. Quality Gates & Verification

| Directive | Source | Priority | Notes |
|---|---|---|---|
| `pnpm run lint` must exit 0 | R-006, R-007 | **Non-negotiable** | Includes `eslint-plugin-boundaries` |
| `pnpm run check` must exit 0 | R-006, R-007 | **Non-negotiable** | svelte-check TypeScript |
| `pnpm run test` must exit 0 | R-006, R-007 | **Non-negotiable** | Vitest suite |
| 100% test coverage for new UI primitives | MASTER-PLAN | Hard policy | — |
| Test empty states and populated states separately | Baseline | Implementation protocol | — |
| Error boundaries at root and project-scoped levels | R-006 | **Non-negotiable** | — |
| XSS mitigation in markdown/HTML rendering | R-006 | **Non-negotiable** | — |
| No `console.log` in production code | R-006 | Hard policy | — |
| No `window.location.href` — use `goto()` | R-006 | Hard policy | — |
| Event-listener cleanup (no memory leaks) | R-006 | Hard policy | — |

### Conflicts & Resolutions

- **Test coverage scope:** MASTER-PLAN says 100% for new primitives; R-006 says coverage for critical flows. Resolution: 100% for new primitives, comprehensive for critical flows, mandatory green suite for every change.

---

## 6. UX Design Discipline

| Directive | Source | Priority | Notes |
|---|---|---|---|
| Visual hierarchy on every surface (primary/secondary/supporting) | Baseline, Lin | Hard policy | — |
| Progressive disclosure (don't show all controls at once) | Baseline | Implementation protocol | — |
| Composition before decoration (anchor, focus, support, metadata) | Baseline, Lin | Hard policy | — |
| Layout authority: intentional space, no weak left-heavy composition | Baseline, Lin | Hard policy | — |
| Input design: labels, placeholders, helper text | Baseline, R-006 | Hard policy | — |
| Hover, focus, active states on all interactive elements | Baseline, R-006 | **Non-negotiable** | a11y overlap |
| Dark theme quality: contrast, elevation, tonal separation | Baseline, Lin, Design System | Hard policy | — |
| Density & hierarchy: compact, aligned, readable | Lin | Implementation protocol | — |
| Prose width: 68ch max | Design System | Implementation protocol | — |

### Conflicts & Resolutions

- **None.** Consistent across all sources.

---

## Priority Summary

| Level | Count | Examples |
|---|---|---|
| **Non-negotiable** | 25 | Svelte 5, boundaries, a11y, lint/check/test, tokens, primitives, shell contract |
| **Hard policy** | 14 | File-length limits, dark theme, composition, button primitives, motion tokens |
| **Implementation protocol** | 6 | Breadcrumbs, progressive disclosure, density, prose width, motion |
