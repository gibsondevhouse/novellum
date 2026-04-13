# Workflow: Refactoring Flow

**Goal:** To improve code quality and maintainability without altering functionality.

**Steps:**

1.  **Request/Identification:** A refactoring need is identified (e.g., via a plan part or manual request).
2.  **Planning:** `Planner Agent` creates a refactoring plan, referencing `GEMINI.md` for goals and `dev-docs/plans/` for scope.
3.  **Execution:** `Frontend Agent` or `Backend Agent` (or both) execute refactoring tasks.
    - Use `refactor.prompt.md` and `editor` skill.
    - Focus on specific areas identified in the plan.
    - Ensure comprehensive test coverage.
4.  **Verification:** `Reviewer Agent` verifies that refactoring meets plan goals, passes all tests, and adheres to `GEMINI.md` conventions.
5.  **Completion:** Plan is updated, and refactoring is merged.
