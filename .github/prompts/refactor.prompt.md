### Refactor Prompt Template

**User Request:** {{ user_request }}
**Plan Reference:** {{ plan_reference }}
**Task Details:** {{ task_details_from_plan }}

**Instruction:**
As a [Frontend/Backend] Agent, refactor the specified code according to the plan.

- Focus on improving [readability, performance, maintainability, modularity].
- Ensure refactoring does not alter existing functionality.
- Update associated tests and documentation.
- Adhere to `GEMINI.md` conventions.
- Leverage `editor` skill for code transformations.

**Output:** Refactored code and updated tests/documentation.
