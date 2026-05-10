# Workflow: Refactoring Flow

**Goal:** To improve code quality and maintainability without altering functionality.

**Steps:**

1.  **Request/Identification:** A refactoring need is identified (e.g., via a plan part or manual request).
2.  **Planning:** `Planner Agent` creates a refactoring plan, referencing `GEMINI.md` for goals and `dev-docs/plans/` for scope.
3.  **Execution:** `Architect Agent`, `Stylist Agent`, or `Backend Agent` (or a combination) execute refactoring tasks.
    - Use `refactor.prompt.md` and `editor` skill.
    - Maintain strict FSD/VSA module boundaries (`dev-docs/modular-boundaries.md`).
    - Migrate legacy state to Svelte 5 Runes (`$state`, `$derived`) or upgrade database queries to `better-sqlite3`.
    - Ensure comprehensive Vitest component coverage.
4.  **Verification:** `Reviewer Agent` verifies that refactoring meets plan goals, passes all tests (`pnpm run test:coverage`), triggers no ESLint boundary violations, and adheres to `.github/instructions/` conventions.
5.  **Completion:** Plan is updated, and refactoring is merged.
