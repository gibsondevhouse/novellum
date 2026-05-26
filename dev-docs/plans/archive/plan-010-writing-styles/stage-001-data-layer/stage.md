# Stage 001: Data Layer Setup

**Objective**: Extend the local SQLite SQLite (`/api/db/*`) database schema to store Writing Styles, Templates, System Prompts, and Nova Chat Instructions. Ensure `eslint-plugin-boundaries` constraint checks pass and 80% test line coverage is reached for new service integrations.

**Tasks**:
- Define database table schema for prompts/styles.
- Create data access layer (queries, inserts).
- Expose via `/api/db/*`.
- Write Vitest tests achieving 80% line coverage minimum.