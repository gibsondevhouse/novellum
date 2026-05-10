# Skill: Vitest & DOM Testing

**Description:** Establishes the testing standards and procedures using Vitest, JSDOM, and `@vitest/coverage-v8`. Crucial for maintaining the 80% coverage threshold enforced across services and business logic.

**Capabilities:**

- Authoring component tests in a JSDOM environment.
- Mocking the API client (`$lib/api-client`) or `better-sqlite3` instance for backend service testing.
- Testing Svelte 5 Rune reactivity inside unit tests (using `$effect.root()` or component mounting if needed).
- Implementing setup and teardown logic using `tests/setup.ts`.
- Validating coverage metrics using `pnpm run test:coverage`.

**Usage:** Agents must activate this skill when a development plan requires the "tests" quality gate, when making changes to core logic (like `active-project` stores), or when writing regression tests for backend API routes.