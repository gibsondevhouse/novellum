# Novellum Frontend Visual Consistency Investigation & Refactor Plan

## Mission

Investigate the entire Novellum frontend and produce a practical refactor plan that makes every page, module, component, and app surface feel like one coherent product.

Do not stop at token compliance. Tokens are necessary, but the goal is visual and experiential consistency across the live application.

Novellum should feel like a dark, cinematic, author-focused writing environment. It should not feel like separate prototypes stitched together, a generic admin dashboard, or a dev console.

## Context

Novellum is a Svelte 5 app with a central UI primitive layer.

Known UI primitives include:

- PrimaryButton
- SecondaryButton
- GhostButton
- DestructiveButton
- SurfaceCard
- SurfacePanel
- SectionHeader
- EmptyStatePanel
- Input
- PillNav

The design system already has tokens for:

- surface layers
- text hierarchy
- border hierarchy
- spacing
- typography
- editorial prose widths
- panel widths
- radius
- shadows
- motion
- focus states

There is also a token enforcement script, but the investigation must go beyond static token violations.

## Primary Question

Do all Novellum screens look and feel like they belong to the same application?

Answer that by inspecting the real frontend implementation, not just design docs.

## Surfaces to Audit

Audit every reachable route and major UI surface, including but not limited to:

1. Project Hub / Dashboard
2. Editor / Writing Surface
3. Outliner
4. Arc Workspace
5. Act Workspace
6. Chapter Workspace
7. Scene Workspace
8. Story Bible
9. Characters / Individuals
10. Factions
11. Lineages
12. Realms
13. Landmarks
14. Myths
15. Technology
16. Traditions
17. Consistency Engine
18. AI Assistant Panel
19. Export
20. Settings
21. Empty states
22. Create-new flows
23. Detail panels
24. Sidebars / navigation rails
25. Modals, drawers, popovers, dropdowns
26. Form surfaces
27. Loading, error, and fallback states

If a route is declared but unreachable, broken, or visually incomplete, record it.

## Investigation Method

Perform a frontend-wide audit in this order:

### 1. Route and Surface Inventory

Map all SvelteKit routes under `src/routes`.

For each route, document:

- route path
- page component
- layout component
- module owner
- primary purpose
- major child components
- whether it is reachable from navigation
- whether it uses the shared app shell
- whether it visually matches the rest of the app

Output a table.

### 2. App Shell Audit

Inspect the global layout, sidebar, navigation rail, headers, page containers, and any persistent panels.

Determine whether all pages use the same:

- background structure
- sidebar behavior
- active nav treatment
- page padding
- content max width
- top-level heading pattern
- panel rhythm
- border treatment
- scroll behavior
- empty/error/loading state treatment

Flag any page that creates its own shell instead of using the canonical shell.

### 3. Visual Language Audit

For each major surface, evaluate:

- Does it feel cinematic and author-facing?
- Does it feel too much like a SaaS dashboard?
- Does it feel too much like a developer console?
- Does it feel too much like a generic CRUD admin page?
- Does it use the same density as nearby screens?
- Does the hierarchy guide the author naturally?
- Does the screen have the same “Novellum” atmosphere as the rest?

Use plain English. Be specific.

Bad finding example:
“The Chapter workspace uses the same colors, but its right panel uses cramped admin-style cards, while the Arc workspace uses larger editorial cards. They technically match tokens, but they do not feel like the same product.”

Good finding example:
“The Story Bible and Outliner both use SurfacePanel, but Story Bible uses heavy grid cards while Outliner uses document-like rows. Decide whether this distinction is intentional. If not, converge them into the same workspace-card pattern.”

### 4. Component Primitive Audit

Search all frontend code for repeated local implementations of:

- cards
- panels
- buttons
- section headers
- tabs
- pills
- inputs
- textareas
- empty states
- stat cards
- metadata rows
- split panes
- workspace hero cards
- inspector panels
- entity cards
- list rows

For each repeated pattern, decide whether it should become:

- a shared primitive
- a module-specific component
- a one-off component that should remain local

Flag duplicate visual structures even when their CSS uses tokens.

### 5. Page Archetype Audit

Classify each screen into one of these archetypes:

- Gallery / project browsing surface
- Writing surface
- Planning workspace
- Entity management surface
- Review / consistency surface
- Export / production surface
- Settings / configuration surface

For each archetype, define the expected visual rules.

Example:

Writing Surface:
- calmest surface in the app
- widest use of prose-focused spacing
- minimal card noise
- medium-like editor body
- tools should feel secondary
- top bar should be restrained

Planning Workspace:
- structured but not corporate
- left-to-right relationship between hierarchy and detail
- cards should feel like manuscript planning, not task management
- selected item detail should use the same inspector rhythm across arcs, acts, chapters, and scenes

Entity Management Surface:
- cinematic database feel
- cards should feel like story-world artifacts, not contact cards
- consistent create/edit/detail treatment across individuals, factions, lineages, realms, landmarks, myths, technology, and traditions

### 6. Density and Rhythm Audit

Check for inconsistent:

- page padding
- card padding
- gaps between sections
- heading margins
- row height
- sidebar width
- inspector width
- grid card width
- form field spacing
- button height
- border radius
- shadow/elevation
- scroll containment

This is especially important. Visual inconsistency often comes from density drift, not color drift.

Create a “density map” showing where screens feel:

- too cramped
- too spacious
- too dashboard-like
- too document-like
- visually balanced

### 7. Typography Audit

Inspect headings, labels, helper text, body copy, button text, metadata text, and prose.

Identify drift in:

- heading size
- heading weight
- serif vs sans usage
- uppercase label usage
- letter spacing
- muted text usage
- metadata treatment
- empty state tone
- AI assistant copy tone
- editor prose styling

Do not simply verify tokens. Decide whether typography creates a unified product voice.

### 8. Interaction Pattern Audit

Inspect how the app handles:

- selected states
- hover states
- active states
- disabled states
- focus states
- destructive actions
- create-new actions
- save actions
- edit modes
- read modes
- inline editing
- panel opening/closing
- tab switching
- navigation transitions

Flag inconsistent interaction behavior.

Example:
“If Arc workspace opens detail inline, but Chapter workspace opens a modal, and Scene workspace uses an inspector drawer, decide whether that is intentional. If not, converge them.”

### 9. Empty, Loading, and Error State Audit

Empty states are a major part of Novellum because authors will often start with blank worlds, blank chapters, and blank arcs.

Audit every empty state.

They should feel:

- author-facing
- calm
- helpful
- not like placeholder dev copy
- not like generic SaaS onboarding
- visually consistent

For each empty state, document:

- route/component
- current visual treatment
- current language
- whether it matches Novellum’s tone
- recommended replacement if needed

### 10. Visual QA Checklist

Create a final cross-surface QA checklist that requires screenshots or manual evidence for:

- Dashboard
- Editor
- Outliner
- Arc workspace
- Act workspace
- Chapter workspace
- Scene workspace
- Story Bible
- Entity detail page
- Entity create page
- Consistency Engine
- AI Assistant Panel
- Export
- Settings
- Empty state
- Error state
- Loading state
- Mobile/narrow layout if supported

## Required Output

Produce a report with these sections:

1. Executive Summary

Explain whether the frontend currently feels visually unified.

Use direct language:
- “Strong foundation, inconsistent experience”
- “Mostly unified, with module-level drift”
- “Token-compliant but visually fragmented”
- or the most accurate diagnosis

2. Surface Inventory Table

Columns:

- Surface
- Route
- Module
- Shell pattern
- Main components
- Visual fit
- Drift severity
- Notes

Use severity:

- Critical
- High
- Medium
- Low
- None

3. Visual Drift Findings

Group findings by category:

- Shell/layout drift
- Card/panel drift
- Typography drift
- Density drift
- Interaction drift
- Empty state drift
- Workspace drift
- Entity surface drift
- Editor-specific drift
- AI assistant drift

Each finding must include:

- affected files
- current problem
- why it hurts product consistency
- recommended fix
- whether fix is local, shared component, or design-system-level

4. Canonical Visual Rules

Define the actual Novellum visual language in implementation terms.

Include rules for:

- page shell
- page header
- cards
- panels
- inspector panels
- forms
- buttons
- tabs/pills
- empty states
- workspace hero cards
- editor surface
- AI assistant surface
- metadata rows
- entity cards
- scroll behavior

5. Refactor Plan

Break the work into stages:

### Stage 1 — Inventory and Evidence
No code changes unless needed to make routes render.
Document all surfaces and capture visual drift.

### Stage 2 — App Shell Convergence
Unify layout wrapper, page padding, sidebar/nav, top-level page header, scroll boundaries.

### Stage 3 — Primitive and Pattern Convergence
Replace local duplicate cards, panels, headers, buttons, empty states, pills, and inputs with canonical primitives.

### Stage 4 — Workspace Family Convergence
Make arcs, acts, chapters, and scenes feel like one workspace family.

### Stage 5 — Story Bible Family Convergence
Make individuals, factions, lineages, realms, landmarks, myths, technology, and traditions feel like one entity-management family.

### Stage 6 — Editor Surface Correction
Ensure the editor feels like the novel-writing surface, not a control center.

### Stage 7 — AI/Consistency/Export Surface Alignment
Make utility surfaces feel connected to the writing product, not separate admin tools.

### Stage 8 — Empty/Error/Loading State Pass
Unify every non-happy-path state.

### Stage 9 — Visual QA Gate
Run screenshots/manual review across all listed surfaces.

6. Implementation Prompts

Write small, sequenced coding-agent prompts for each stage.

Each prompt must include:

- exact goal
- files/components to inspect
- constraints
- acceptance criteria
- what not to change

## Constraints

- Use Svelte 5 runes.
- Do not introduce new design tokens unless absolutely necessary.
- Prefer existing tokens from `src/styles/tokens.css`.
- Prefer existing UI primitives from `src/lib/components/ui`.
- Do not solve consistency by making every surface identical.
- Preserve intentional differences between writing, planning, entity management, export, and settings surfaces.
- Do not touch backend, persistence, or AI logic unless required to render frontend state.
- Avoid broad rewrites without evidence.
- Every recommendation must point to real files/components/routes.
- Use `goto()` for navigation. Do not use `window.location.href`.

## Acceptance Criteria

The final result is acceptable only if:

- every route and major component surface has been inventoried
- every major visual drift issue is tied to a real file/component
- the app shell has one canonical pattern
- workspace pages share one recognizable family
- Story Bible/entity pages share one recognizable family
- the Editor feels like a focused writing surface
- empty states feel authored, not placeholder
- token enforcement still passes
- lint/check/test still pass
- visual QA evidence exists for all major surfaces