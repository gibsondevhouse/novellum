### Fix Bug Prompt Template

**User Request:** {{ user_request }}
**Bug Description:** {{ bug_details }}
**Plan Reference:** {{ plan_reference }}
**Affected Files/Modules:** {{ affected_files }}

**Instruction:**
As a [Frontend/Backend] Agent, diagnose and fix the described bug.

- Reproduce the bug if necessary.
- Identify the root cause.
- Implement a robust fix.
- Write a new test case to cover this bug.
- Ensure the fix adheres to `GEMINI.md` conventions and project standards.
- Use VS Code debugging tools for analysis.

**Output:** Code fix, new test case, and potentially updated documentation.
