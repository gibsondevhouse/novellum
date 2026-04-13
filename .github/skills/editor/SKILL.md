# Skill: Code Editor Utilities

**Description:** Provides common code manipulation and editing functionalities that agents can leverage.

**Capabilities:**

- Read file content.
- Write file content.
- Replace text within files (exact match, multiple occurrences).
- Insert text at specific locations.
- Format code based on project standards.
- Generate boilerplate code for common structures.

**Usage:** Agents call functions like `editor.readFile(filePath)`, `editor.writeFile(filePath, content)`, `editor.replaceText(filePath, oldString, newString)`.
