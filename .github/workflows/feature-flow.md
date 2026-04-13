# Workflow: Feature Development Flow

**Goal:** To implement and deliver a new feature, ensuring it's production-ready.

**Steps:**

1.  **User Request:** A feature is requested (e.g., via issue).
2.  **Planning:** `Planner Agent` creates a detailed plan in `dev-docs/plans/`.
3.  **Task Assignment:** `Planner Agent` assigns parts of the plan to `Frontend Agent`, `Backend Agent`, and `AI Agent` as needed.
4.  **Implementation:**
    - Agents research documentation, leverage prompts/skills, and use VS Code tools.
    - Agents implement code, following `GEMINI.md` conventions.
    - Agents create/update relevant files and run initial tests.
5.  **Code Submission:** Code changes are prepared (e.g., staged for commit).
6.  **Review:** `Reviewer Agent` validates code against the plan, runs checks (lint, test), and consults `GEMINI.md`.
7.  **Iteration:** If revisions are needed, the process returns to relevant agents.
8.  **Completion:** Once approved, code is merged. `Planner Agent` updates `MASTER-PLAN.md` and plan status.
