# Plan 009: Library Redesign — Curated Collections View

## 1. Overview and Objectives
**Goal**: Restructure the Novellum Library (`src/routes/+page.svelte`) strictly as a "Reading Room", moving away from workspace/productivity layouts. We are implementing **Option 4: The Curated "Collections" View** (inspired by Netflix/Apple Books), utilizing horizontal scrolling rows of portrait-style book covers categorized by their state/genre.

**Mandatory Directives**:
- **Svelte 5 Runes**: All new UI components and state logic must exclusively use Svelte 5 Runes (`$state`, `$derived`, `$props`).
- **Boundary Verification**: Must pass `pnpm run lint` (`eslint-plugin-boundaries`) to ensure no domain leakage.
- **Testing Requirements**: UI/Component changes must be accompanied by Vitest coverage checks (`pnpm run test`).
- **Data Source**: Fetching relies on `project-hub.svelte.ts` which ultimately must sync with the server-side SQLite database.

## 2. Plan Stages

### Stage 1: Design System & Core UI Primitives
*Assigned to: `stylist` / `architect`*

- **Phase 1.1: Portrait Book Cover Card**
  - **Part 1**: Create `src/modules/project/components/BookCoverCard.svelte`.
  - **Part 2**: Style the card with a portrait aspect ratio (e.g., 2:3 or 5:8). Use the existing abstraction/gradient logic for the cover background.
  - **Part 3**: Overlay title typography beautifully. Remove dense productivity metrics (word counts); replace with reader metrics (e.g., % read, or just simple "Draft"/"Completed" labels).
- **Phase 1.2: Horizontal Scroll Row Container**
  - **Part 1**: Create `src/modules/project/components/CollectionRow.svelte`.
  - **Part 2**: Implement a horizontal flexing layout (`overflow-x: auto`, `scroll-snap-type: x mandatory`). Hide the scrollbar for a clean, app-like feel.
  - **Part 3**: Add row headers (e.g., "Recently Read", "Completed", "Short Stories").

### Stage 2: Data Categorization & Page Composition
*Assigned to: `architect`*

- **Phase 2.1: State Derivation (Svelte 5)**
  - **Part 1**: Update `src/routes/+page.svelte`.
  - **Part 2**: Import `getProjects()` from `project-hub.svelte.ts`.
  - **Part 3**: Create `$derived` arrays to categorize books: 
    - `recentlyRead` (sorted by last updated)
    - `completedWorks` (projects where status is completed)
    - `worksInProgress` (projects where novel is drafting/editing)
- **Phase 2.2: Layout Refactor**
  - **Part 1**: Replace the `LibraryHeroCard` vertical stack in `/src/routes/+page.svelte` with multiples of `CollectionRow` mapping over the categorized derived arrays.
  - **Part 2**: Add a hero "Continue Reading" banner at the very top displaying the single most recently interacted-with book.

### Stage 3: Verification & Polish
*Assigned to: `reviewer`*

- **Phase 3.1: Boundary Checks**
  - **Part 1**: Run `pnpm run lint` and verify no FSD boundary violations were introduced between `project` module and UI routes.
- **Phase 3.2: Testing**
  - **Part 1**: Add rendering tests for `BookCoverCard` and `CollectionRow` (`pnpm run test`). 
  - **Part 2**: Verify UI responsive breakpoints down to mobile screens (horizontal scroll works perfectly on touch).

## 3. Checklist
- [ ] Phase 1.1 completed
- [ ] Phase 1.2 completed
- [ ] Phase 2.1 completed
- [ ] Phase 2.2 completed
- [ ] Phase 3.1 (lint boundary verification) passing
- [ ] Phase 3.2 (tests) passing
