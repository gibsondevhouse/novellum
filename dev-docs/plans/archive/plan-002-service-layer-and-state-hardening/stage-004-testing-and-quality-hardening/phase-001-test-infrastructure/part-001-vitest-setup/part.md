---
title: Vitest Setup
slug: part-001-vitest-setup
part_number: 1
status: complete
owner: Backend Agent
phase: phase-001-test-infrastructure
estimated_duration: 1d
---

## Objective

Install Vitest with jsdom environment and `fake-indexeddb` so that Dexie-based service layer code is testable in Node.js. Establish coverage reporting and a smoke test.

## Install Commands

```sh
pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/jest-dom fake-indexeddb
```

## Configuration

### `vitest.config.ts` (create at repo root)

```ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		setupFiles: ['src/test-setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/lib/ai/**', 'src/modules/**/services/**'],
		},
	},
});
```

### `src/test-setup.ts` (create)

```ts
import 'fake-indexeddb/auto';
```

This automatically polyfills `indexedDB` in the jsdom environment before any test runs.

### `package.json` scripts to add

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

## Smoke Test

Create `src/lib/db/db.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('Dexie db', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('opens successfully', async () => {
		expect(db.isOpen()).toBe(true);
	});
});
```

## Acceptance Criteria

- [ ] All dev dependencies installed; `pnpm install` completes without errors
- [ ] `vitest.config.ts` and `src/test-setup.ts` created
- [ ] `pnpm run test` executes the smoke test and passes
- [ ] `pnpm run test:coverage` generates a coverage report
- [ ] `pnpm run check` exits clean
