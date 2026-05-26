---
title: ESLint Boundaries Setup
slug: part-002-eslint-boundaries-setup
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-002-app-stores-and-boundaries-tooling
estimated_duration: 1d
---

## Objective

Install `eslint-plugin-boundaries` and configure it to machine-enforce the import matrix defined in `dev-docs/modular-boundaries.md`. The linter must block forbidden cross-module imports automatically.

## Steps

### 1. Install

```sh
pnpm add -D eslint-plugin-boundaries
```

### 2. Configure

Add to `eslint.config.js` (SvelteKit uses flat config):

```js
import boundaries from 'eslint-plugin-boundaries';

// Element types matching the module structure
boundaries.settings.elements = [
	{ type: 'lib', pattern: 'src/lib/**' },
	{ type: 'module-editor', pattern: 'src/modules/editor/**' },
	{ type: 'module-story-bible', pattern: 'src/modules/story-bible/**' },
	{ type: 'module-outliner', pattern: 'src/modules/outliner/**' },
	{ type: 'module-project-hub', pattern: 'src/modules/project-hub/**' },
	{ type: 'routes', pattern: 'src/routes/**' },
];

// Allowed imports per the matrix in modular-boundaries.md
boundaries.rules = {
	'boundaries/element-types': [
		2,
		{
			default: 'disallow',
			rules: [
				{
					from: 'routes',
					allow: [
						'lib',
						'module-editor',
						'module-story-bible',
						'module-outliner',
						'module-project-hub',
					],
				},
				{ from: 'module-editor', allow: ['lib'] },
				{ from: 'module-story-bible', allow: ['lib'] },
				{ from: 'module-outliner', allow: ['lib'] },
				{ from: 'module-project-hub', allow: ['lib'] },
				{ from: 'lib', allow: ['lib'] },
			],
		},
	],
};
```

> Exact config syntax may vary by eslint-plugin-boundaries version — consult its README if the above does not parse. Do NOT modify the matrix; only adjust config syntax.

### 3. Validate

- Run `pnpm run lint` with no boundary violations
- Deliberately add a cross-module import (e.g., import editor store from story-bible), verify it triggers an error, then revert

## Acceptance Criteria

- [ ] `eslint-plugin-boundaries` installed as a dev dependency in `package.json`
- [ ] `eslint.config.js` updated with elements and rules matching `modular-boundaries.md` matrix
- [ ] `pnpm run lint` exits clean with zero violations on current codebase
- [ ] Evidence file `evidence/boundary-violation-test-YYYY-MM-DD.md` documents the deliberate test: what was added, what error was triggered, and that it was reverted
- [ ] `pnpm run check` exits clean
