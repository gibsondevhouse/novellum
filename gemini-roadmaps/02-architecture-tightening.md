# Roadmap 02: Architecture Tightening

> Focus: Fixing modularity leaks, decoupling layers, and enforcing strict boundaries.

## 1. Eliminate Boundary Leak (lib -> module-continuity)
- **Goal**: Ensure the core library is generic and does not depend on specific feature modules.
- **Actions**:
    - Identify the specific symbols from `module-continuity` used in `lib`.
    - Refactor these symbols into `lib/ai` or use an interface-injection pattern if they must remain in the module.
    - Update `eslint.config.js` to strictly disallow `lib` -> `module-*` dependencies.

## 2. Decouple API from Database Schema
- **Goal**: Prevent UI breakage when the database schema changes.
- **Actions**:
    - **Introduce DTOs**: Create explicit Data Transfer Objects (DTOs) for the API layer that differ from the SQLite domain types.
    - **Refactor `api-helpers.ts`**: Evolve the table-direct handlers into "Service-Aware" handlers that can execute business logic before/after database operations.
    - **Strongly Typed Responses**: Ensure all API routes return explicitly typed DTOs rather than generic `Record<string, unknown>`.

## 3. Repository Layer Refactor
- **Goal**: Remove duplication and clarify the role of repositories.
- **Actions**:
    - **Custom Logic Separation**: Move any non-CRUD logic out of the `Repository` and into `Module Services`.
    - **Repository Factory Evolution**: Enhance `createRepository` to support middleware-like hooks for pre/post processing of entities.
    - **Active Project Context**: Better integrate `active-project.svelte.ts` with repositories so `projectId` is automatically injected into queries where appropriate.

## 4. Shared UI Shell Hardening
- **Goal**: Standardize the "Surface" contracts across all modules.
- **Actions**:
    - Audit all `+page.svelte` files for consistent usage of `SurfaceCard`, `SurfacePanel`, etc.
    - Enforce the "Linearization" UI system through stricter CSS variable checks.
    - Create a shared `Breadcrumbs` service that modules can use to register their position in the hierarchy.
