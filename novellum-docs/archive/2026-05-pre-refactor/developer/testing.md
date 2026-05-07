# Testing Guide

Novellum uses **Vitest** as its primary test framework, with `@testing-library/svelte` for component tests and **Playwright** for visual regression tests.

---

## Running Tests

### Run all tests once

```sh
pnpm run test
```

This is equivalent to `vitest run`. Use it before opening a PR to confirm nothing is broken.

### Run a single test file

```sh
pnpm vitest run tests/export/assembler.test.ts
```

Replace the path with any test file path relative to the workspace root. This is the fastest way to iterate on a specific module.

### Run tests in watch mode

```sh
pnpm run test:watch
```

Vitest re-runs the relevant test file every time you save a change. Recommended during active development.

### Run with coverage

```sh
pnpm run test:coverage
```

Generates a v8 coverage report. Open `coverage/index.html` in a browser to see line-by-line coverage for each file. Coverage thresholds are enforced for `src/lib/services/**` and `src/lib/ai/**` — both require **≥ 80% line coverage**.

---

## Test Environment

Novellum uses Vitest's `environmentMatchGlobs` to assign the right environment to each test file:

| Pattern | Environment | Purpose |
| :--- | :--- | :--- |
| `tests/**/*.test.ts` (default) | `jsdom` | Component and DOM tests |
| `tests/db/**`, `tests/sqlite/**` | `node` | Pure-logic, server-side, DB tests |
| `tests/ai/**` | `node` | AI pipeline and prompt builder tests |

If you are writing a test that does not touch the DOM, you can declare `node` environment explicitly at the top of the file:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest';
```

---

## Writing Component Tests

Use `@testing-library/svelte` to render and interact with Svelte components.

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, afterEach, vi } from 'vitest';
import MyComponent from '$modules/project/components/MyComponent.svelte';

describe('MyComponent', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the title', () => {
    render(MyComponent, { props: { title: 'Hello' } });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

Always call `vi.clearAllMocks()` in `afterEach` to prevent mock state from leaking between tests.

---

## Writing Service and Store Tests

For service tests, mock the database layer to isolate business logic from SQLite:

```ts
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('$modules/project/services/project-repository.js');

import { createProject } from '$modules/project/services/project-service.js';
import { projectRepository } from '$modules/project/services/project-repository.js';

describe('createProject', () => {
  afterEach(() => vi.clearAllMocks());

  it('calls the repository with correct arguments', async () => {
    vi.mocked(projectRepository.insert).mockResolvedValue({ id: '1', title: 'Test' });
    const result = await createProject({ title: 'Test', genre: 'Fantasy' });
    expect(projectRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test' })
    );
    expect(result.id).toBe('1');
  });
});
```

---

## Mocking Patterns

### Mocking SQLite repositories

Mock the repository module using `vi.mock()` at the top of the test file, before imports. This replaces the entire module with auto-mocked stubs that you can configure per test with `vi.mocked(...).mockResolvedValue(...)`.

### Mocking Dexie (IndexedDB)

For tests that exercise portability or import/export code which touches Dexie, add the `fake-indexeddb` polyfill to the test file:

```ts
import 'fake-indexeddb/auto';
```

This installs an in-memory IndexedDB implementation in the test environment. No setup or teardown is needed beyond clearing mocks in `afterEach`.

### Mocking the AI API

Mock `$lib/ai/openrouter-client.ts` to prevent real HTTP requests in AI-related tests:

```ts
vi.mock('$lib/ai/openrouter-client.ts', () => ({
  callModel: vi.fn().mockResolvedValue({ content: '{"ideas": []}' })
}));
```

### Mocking preferences

Mock `$lib/preferences.ts` when testing components or services that read user settings:

```ts
vi.mock('$lib/preferences.ts', () => ({
  getPreference: vi.fn().mockReturnValue('default-value'),
  setPreference: vi.fn()
}));
```

---

## Async Error Tests

When testing code paths that are expected to throw, use `expect.assertions(n)` to ensure the assertion actually ran:

```ts
it('throws when project is not found', async () => {
  expect.assertions(1);
  vi.mocked(projectRepository.findById).mockResolvedValue(null);
  await expect(getProject('missing-id')).rejects.toThrow('Project not found');
});
```

---

## Visual Regression Tests

Visual regression tests use Playwright and live in `tests/visual/`. They compare screenshots against stored baseline images.

### Running visual tests

Visual tests require a running server. In two separate terminals:

```sh
# Terminal 1 — start the dev server
pnpm run dev

# Terminal 2 — run the visual tests
pnpm run test:visual
```

Or use the production build with `pnpm run preview` and set `BASE_URL=http://localhost:4173`.

### Snapshots

Baseline screenshots are stored in `tests/visual/__screenshots__/`. If you intentionally change the appearance of a component, update the baseline by running:

```sh
pnpm run test:visual --update-snapshots
```

Commit the updated snapshots alongside your code change.

---

## Test File Location Convention

Test files live in `tests/` in a directory structure that mirrors `src/`:

```text
src/modules/export/services/assembler.ts
  → tests/export/assembler.test.ts

src/lib/ai/draft-agent.ts
  → tests/ai/draft-agent.test.ts

src/modules/project/components/ProjectCard.svelte
  → tests/project/ProjectCard.test.ts
```

Use `describe` → `it` structure. Keep each `describe` block focused on a single function or component.
