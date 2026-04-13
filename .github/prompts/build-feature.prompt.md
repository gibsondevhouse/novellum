### Build Feature Prompt Template

**User Request:** {{ user_request }}
**Plan Reference:** {{ plan_reference }}
**Task Details:** {{ task_details_from_plan }}

**Instruction:**
As a [Frontend/Backend] Agent, implement the feature described.

- Utilize project conventions from `GEMINI.md`.
- Adhere strictly to the plan's acceptance criteria and file updates.
- Research official documentation for any new libraries or APIs used.
- Ensure code is well-commented (why, not what), linted, and formatted.
- Integrate with existing [Frontend/Backend] components as per plan.
- If AI assistance is needed, formulate a clear prompt for the AI Agent.

**Output:** Code implementation for the specified feature part.
