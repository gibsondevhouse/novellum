# Roadmap 01: Unblocking Productivity

> Focus: Quick wins, developer experience, and immediate performance gains.

## 1. Naming Consistency (Plan-019)
- **Goal**: Align the codebase with `dev-docs/` terminology to reduce cognitive load.
- **Actions**:
    - Audit all modules and routes for naming discrepancies.
    - Rename `story-bible` to `world-building` (if not already fully done).
    - Align component names with their respective modules.
    - Update `eslint-plugin-boundaries` to reflect the new naming scheme.

## 2. AI Context Engine Optimization
- **Goal**: Reduce the latency of AI requests by optimizing context building.
- **Actions**:
    - **Batch Fetching**: Introduce bulk endpoints for characters, locations, etc. (e.g., `/api/db/characters?ids=a,b,c`).
    - **Server-Side Context Construction**: Move context building logic to the server layer to avoid multiple round-trips from the client to `/api/db`.
    - **Caching**: Implement simple TTL caching for project-wide data (lore, characters) during a single agent session.

## 3. Error Handling & Resilience
- **Goal**: Improve the stability of the app during network or database failures.
- **Actions**:
    - Enhance `ApiError` with more descriptive context.
    - Implement a global error boundary for Svelte 5 routes.
    - Add "Retry" mechanisms for AI streaming requests.

## 4. Developer Workflow
- **Goal**: Faster feedback loops.
- **Actions**:
    - Optimize `vitest` configuration for faster test runs.
    - Add more comprehensive mock data generators for the AI pipeline.
    - Document the "Portability Runbook" for easier dev-machine setup.
