### Refactor Prompt Template

**User Request:** {{ user_request }}
**Plan Reference:** {{ plan_reference }}
**Task Details:** {{ task_details_from_plan }}

**Instruction:**
As a [Frontend/Backend] Agent, refactor the specified code according to the plan.

- Focus on improving [readability, performance, maintainability, modularity].
- Migrate legacy patterns to modern standards (e.g., Svelte 5 Runes, SQLite `db.transaction()`) following `.github/instructions/`.
- Ensure refactoring does not alter existing functionality.
- Ensure strict modular boundaries (`dev-docs/modular-boundaries.md`) are respected.
- Update associated tests to maintain or exceed 80% coverage, and sync documentation.
- Adhere to `GEMINI.md` conventions.
- Leverage `editor` skill for code transformations.

**Output:** Refactored code and updated tests/documentation.
