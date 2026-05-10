### Generate Schema Prompt Template

**User Request:** {{ user_request }}
**Context:** {{ context_for_schema_generation }} (e.g., data entities, API endpoints)
**Plan Reference:** {{ plan_reference }}

**Instruction:**
As an AI or Backend Agent, generate a schema definition for the specified data structure.

- Target format: [JSON Schema / TypeScript Interface / Database Schema DDL].
- Ensure schema aligns with project conventions and data requirements.
- Consider validation rules and data types.

**Output:** Schema definition file.
