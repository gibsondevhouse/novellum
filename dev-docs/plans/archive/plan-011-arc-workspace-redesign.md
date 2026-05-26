# Plan 011: Arc Workspace High-Density Redesign

## Objective
Refactor the Arc Workspace from a low-density, generic card view into a high-density, professional narrative development environment (comparable to Linear/Notion). This includes a Hero Arc Panel, a Beat Progression Lane, and an Arc Health diagnostic panel.

## Scope
- **UI/UX**: Implement a dual-column layout (`.arc-main-layout`) containing the Hero Panel, Progression Lane, and analytical Sidebars.
- **State**: Build Svelte 5 state management for Arc selection and visual state transitions.
- **Styling**: Ensure high-fidelity polish using Design System tokens (strict spacing, subtle borders, high information density).
- **Data**: Prepare the underlying structure for "Story Beats" connected to Arcs.
- **Verification**: Enforce strict `eslint-plugin-boundaries` checks and Svelte 5 `$state` paradigms.

## Stages

### Stage 1: Structural Scaffolding & State (Architect Agent)
- [ ] **Part 1**: Re-scaffold the `+page.svelte` and `+page.ts` components to support the `workspace-arc-container`.
- [ ] **Part 2**: Utilize Svelte 5 `$state` variables to manage active arc selection and inline-edit modes.
- [ ] **Part 3**: Scaffold the `beat-card` component logic (no styling yet, just structural Svelte loop).
- **Validation**: Ensure components successfully load data without throwing Svelte compiler errors.

### Stage 2: Visual Styling & Polish (Stylist Agent)
- [ ] **Part 1**: Design the layout grid (70% primary col, 30% sidebar). Apply exact spacing tokens.
- [ ] **Part 2**: Build the high-density Hero Panel & Progress Bar styles.
- [ ] **Part 3**: Style the Progression Beat Lane with dropzone hover states and status indicator styles.
- [ ] **Part 4**: Style the Context/Avatar chips and the Health Diagnostic Panel items.
- **Validation**: Confirm UI matches Linear/Notion polish levels (verified through visual inspection of browser screenshot).

### Stage 3: Data Integration & Interactivity (Backend/Architect Agent)
- [x] **Part 1**: Implement `/api/db/*` SQLite persistence for `StoryBeat` entities attached to Arcs and complete parameters. Schema updated to include `arcId` on Beats and `beatId` on new Stages table + added endpoints. Tested via manual review.
- [ ] **Part 2**: Wire up the "Add Beat" interaction to push optimistic UI updates.
- [ ] **Part 3**: Wire the logline editor to save via debounced updates.
- **Validation**: Verify 80% test coverage for the Beat data service.

### Stage 4: Review & Compliance (Reviewer Agent)
- [ ] **Part 1**: Run `pnpm run lint` to explicitly check `eslint-plugin-boundaries` (no cross-module leakage).
- [ ] **Part 2**: Run `pnpm run test:coverage` to ensure tests resolve successfully.
- [ ] **Part 3**: Address any Svelte compiler or A11y warnings introduced.

---
## Notes
- Rely strictly on Svelte 5 runes (`$state`, `$derived`, etc.).
- Ensure all styles are locally scoped or use appropriate global modifiers when strictly necessary, relying on Novellum variable design tokens over hardcoded HEXs.
