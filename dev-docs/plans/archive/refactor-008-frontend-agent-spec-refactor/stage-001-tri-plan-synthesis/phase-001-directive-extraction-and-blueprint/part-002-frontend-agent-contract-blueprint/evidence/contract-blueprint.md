# Frontend Agent Contract Blueprint

> Target structure for the rewritten `.github/agents/frontend.agent.md`.
> Each section is classified as: **Hard Policy** (non-negotiable, enforceable), **Implementation Protocol** (required approach), or **Guidance** (advisory best practice).

---

## Target Section Map

### STRATEGIC CONTRACT (Identity & Product Doctrine)

| # | Section | Classification | Source Directives | Purpose |
| --- | --- | --- | --- | --- |
| 1 | **ROLE** | Hard Policy | Baseline | Identity, authority, output expectations |
| 2 | **CORE MANDATE** | Hard Policy | Baseline, R-007 | Product-level quality bar (6 principles) |
| 3 | **PRIMARY PRODUCT RULE** | Hard Policy | R-007, Lin | Continuous workspace, not disconnected pages |
| 4 | **ROUTE-FAMILY DOCTRINE** | Hard Policy | R-007, Lin | Per-route character (Hub/Outline/Editor/Bible/Consistency) + cohesion requirement |
| 5 | **SHARED SHELL CONTRACT** | Hard Policy | R-007, Lin | Masthead, mode switcher, content frame, spacing |
| 6 | **COMPOSITION & PRIMITIVES** | Hard Policy | R-007, R-006, Lin | Primitive-first, component decomposition, reuse over handcrafting |

### OPERATIONAL CONTRACT (Technical Guardrails & Quality)

| # | Section | Classification | Source Directives | Purpose |
| --- | --- | --- | --- | --- |
| 7 | **ARCHITECTURE & BOUNDARIES** | Hard Policy | R-006, Lin, Boundaries doc | SvelteKit, Svelte 5, module boundaries, file limits |
| 8 | **SVELTE 5 RUNES PROTOCOL** | Hard Policy | Lin | Runes-only, snippets, `.svelte.ts`, event attrs |
| 9 | **DESIGN TOKENS & STYLING** | Hard Policy | R-006, R-007, Lin, Design System | Token-only values, surface layers, borders, typography, motion |
| 10 | **ACCESSIBILITY** | Hard Policy | R-006 | Labels, focus, keyboard, ARIA, contrast, tab order |
| 11 | **STATE & FORMS** | Implementation Protocol | Baseline | Stores, local state, persistence, form actions |
| 12 | **PERFORMANCE** | Implementation Protocol | Baseline | Re-renders, lazy loading, shell stability |
| 13 | **UX DESIGN STANDARDS** | Guidance → Hard Policy (subset) | Baseline, Lin | Hierarchy, layout authority, progressive disclosure, input design, interaction quality, dark theme |

### ENFORCEMENT CONTRACT (Verification & Self-Check)

| # | Section | Classification | Source Directives | Purpose |
| --- | --- | --- | --- | --- |
| 14 | **MANDATORY QUALITY GATES** | Hard Policy | R-006, R-007 | `pnpm run lint`, `pnpm run check`, `pnpm run test` — must all exit 0 |
| 15 | **FAILURE CONDITIONS** | Hard Policy | Baseline, R-006, R-007 | Explicit list of reject-own-work triggers |
| 16 | **SELF-CHECK PROTOCOL** | Hard Policy | Baseline | Pre-completion verification rubric |
| 17 | **RESOURCES** | Guidance | Baseline | Links to GEMINI.md, dev-docs, skills |

---

## Enforcement Model

### Non-Negotiable Gates (must pass before any PR/completion)

1. `pnpm run lint` exits 0 (includes `eslint-plugin-boundaries`)
2. `pnpm run check` exits 0 (svelte-check TypeScript)
3. `pnpm run test` exits 0 (Vitest full suite)
4. No `any` type usage
5. No hardcoded style values outside token definitions
6. No cross-module internal imports
7. Svelte 5 runes only (no `export let`, no `$:`, no `<slot />`)

### Failure Conditions (reject own work if any true)

1. Route uses one-off markup instead of shared primitives
2. Surfaces feel structurally inconsistent across route family
3. Content frames drift between routes
4. Empty states look like placeholders
5. Mode switching feels visually inconsistent
6. No clear visual hierarchy
7. Inputs lack labels/guidance
8. Accessibility is ignored (focus, keyboard, ARIA)
9. State is fragile or lossy
10. Console logs present in production code
11. `window.location.href` used instead of `goto()`

### Self-Check (verify before completion)

1. Reused existing shell/primitive instead of rebuilding?
2. Route aligns visually with other project routes?
3. Spacing, width, alignment match app-wide contract?
4. Surface feels like Novellum (not generic admin/form)?
5. Would look coherent next to Hub, Outline, and Editor?
6. All three gate commands executed and passing?
7. No new lint warnings introduced?

---

## Rewrite Checklist for Stage 002

### Part 1 — Strategic Sections (Sections 1-6)

- [ ] Consolidate ROLE to be concise + authoritative
- [ ] Merge CORE MANDATE with product rule (remove duplication)
- [ ] Rewrite route-family doctrine from directive matrix
- [ ] Consolidate shell contract into single definitive section
- [ ] Merge composition rules + primitives list into one section
- [ ] Remove aspirational prose; keep enforceable language

### Part 2 — Operational & Enforcement Sections (Sections 7-17)

- [ ] Rewrite architecture section with Lin's Svelte 5 specifics
- [ ] Create dedicated Svelte 5 runes protocol section
- [ ] Consolidate token/styling rules from 3 sources
- [ ] Tighten accessibility from guidance to hard requirements
- [ ] Add explicit quality gate commands with pass criteria
- [ ] Rewrite failure conditions from consolidated matrix
- [ ] Sharpen self-check into reviewer-usable rubric
- [ ] Remove outdated references, add current resource links
