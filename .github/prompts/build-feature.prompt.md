### Build Feature Prompt Template

**User Request:** {{ user_request }}
**Plan Reference:** {{ plan_reference }}
**Task Details:** {{ task_details_from_plan }}

**Instruction:**
As a [Frontend/Backend] Agent, implement the feature described.

- Utilize project conventions from `GEMINI.md` and strictly adhere to `.github/instructions/` (e.g., Svelte 5 Runes, SQLite rules).
- Adhere strictly to the plan's acceptance criteria and file updates.
- Ensure strict modular boundaries (`dev-docs/modular-boundaries.md`) are respected.
- Include Vitest component or service tests maintaining 80% coverage.
- Research official documentation for any new libraries or APIs used.
- Ensure code is well-commented (why, not what), linted, and formatted.
- Integrate with existing components as per plan.

**Output:** Code implementation for the specified feature part.
