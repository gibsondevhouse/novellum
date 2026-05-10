# Skill: Modular Boundaries

**Description:** Enforces Vertical Slice Architecture (VSA) and Feature-Sliced Design constraints, ensuring no single domain reaches directly into another domain's internals.

**Capabilities:**

- Validating import boundary compliance against `dev-docs/modular-boundaries.md`.
- Preventing the creation of "god files" or monolithic components exceeding line budget constraints.
- Restricting routes (`+page.svelte`, `+layout.svelte`) to orchestration logic only.
- Ensuring domain services (`services/*.ts`) remain pure TypeScript and contain zero UI/Svelte concepts.
- Defining correct sharing mechanisms (barrel `index.ts` files or `$lib/` utilities).

**Usage:** Agents must activate this skill as a primary quality gate when authoring new components, services, and route changes to prevent technical debt and architecture erosion.
---

### Implementation Standard: Import Boundary Matrix

The following table dictates which layers may import from which. Violations will cause `eslint-plugin-boundaries` to fail the build.

| Importing from -> | `$lib/utils` | `$lib/db` | `$lib/stores` | `$lib/components` | `$modules/<domain>` (public) | `$modules/<domain>` (internal) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Route files** | Yes | No | Yes | Yes | Yes | No |
| **Load functions** | Yes | Yes | No | No | Yes (services) | No |
| **Module components** | Yes | No | Yes | Yes | No | Yes (own module) |
| **Module services** | Yes | Yes | No | No | No | Yes (own module) |
| **Module stores** | Yes | Yes | Yes | No | No | Yes (own module) |
| **Server routes** | Yes | Yes | No | No | Yes (services) | No |
