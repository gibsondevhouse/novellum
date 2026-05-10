# Skill: Dexie Data Layer

**Description:** Provides specialized knowledge for interacting with IndexedDB via Dexie.js, representing the core local-first persistence mechanism of the application. 

**Capabilities:**

- Designing and querying Dexie database schemas.
- Managing database migrations using `Version.upgrade()`.
- Performing complex queries using `WhereClause` and table filters.
- Wiring Dexie data into Svelte components via `liveQuery()`.
- Managing relations across local collections (e.g., matching scenes to chapters to acts).

**Usage:** Agents should utilize this skill when building services (`src/modules/*/services/`), resolving offline data logic, handling schemas (`src/lib/db/`), or writing database tests, ensuring no cross-contamination between projects.