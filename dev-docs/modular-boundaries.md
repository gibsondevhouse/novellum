# Modular Boundaries & Anti-Monolithic Architecture

This document is the authoritative specification for Novellum's component and module boundary constraints. All coding agents must comply with these rules without exception. Violations must be flagged and corrected during code review before any part is marked `complete`.

---

## Discipline Names

This document enforces a combination of three named software disciplines applied cohesively:

| Discipline                                | Scope           | What It Governs                                                       |
| ----------------------------------------- | --------------- | --------------------------------------------------------------------- |
| **Vertical Slice Architecture (VSA)**     | Module level    | Each feature domain owns its entire stack — UI, logic, service, types |
| **Feature-Sliced Design (FSD)**           | Directory level | Source is organized by domain slice, not by technical layer           |
| **Single Responsibility Principle (SRP)** | File level      | Each file has exactly one reason to change                            |

The result is a codebase where no single file becomes a catch-all, no module depends on internals of another, and every addition is traceable to a specific domain.

---

## The Core Constraint: No Monolithic Files

A **monolithic file** is any file that:

- Contains more than one logical component, service, or concern
- Mixes UI rendering with data-fetching logic and business rules in the same function
- Exceeds ~250 lines without a clear justification documented at the top of the file
- Is referenced by more than two unrelated modules (signals it should become a shared utility)

**These patterns are prohibited:**

```ts
// ❌ FORBIDDEN — one file doing everything
// src/routes/projects/[id]/editor/+page.svelte
// 800 lines: renders UI, manages Dexie queries, assembles AI context,
//            handles keyboard shortcuts, formats export — all in one file
```

```ts
// ❌ FORBIDDEN — cross-module internal import
// src/modules/outliner/services/outliner-service.ts
import { bibleStore } from '../bible/stores/bible-store'; // reaches into another module's internals
```

```ts
// ❌ FORBIDDEN — god-store
// src/stores/app.ts
// exports 30+ reactive variables for every module in the app
```

---

## Module Boundary Rules

### Rule 1 — Module internals are private

Every module (`src/modules/<domain>/`) exposes **only what is declared in its `index.ts`**. Anything not re-exported from `index.ts` is private to that module. Other modules may not import from internal paths like `src/modules/bible/services/character-service.ts` directly.

```ts
// ✅ ALLOWED — consume the public API
import { getCharacters } from '$modules/bible';

// ❌ FORBIDDEN — bypass the barrel and import internals
import { getCharacters } from '$modules/bible/services/character-service';
```

### Rule 2 — Modules may not import from sibling modules' internals

Cross-domain communication happens through:

1. **Shared `$lib/` utilities** — pure functions with no domain coupling
2. **Events / callbacks** passed down from a parent route
3. **Svelte 5 stores in `src/lib/stores/`** that represent genuinely app-level concerns (e.g., `active-project`, `ai-panel`) — not domain-specific state

```ts
// ✅ ALLOWED — shared utility
import { formatDate } from '$lib/utils/date';

// ✅ ALLOWED — app-level store
import { activeProjectId } from '$lib/stores/active-project';

// ❌ FORBIDDEN — bible module pulling outliner state directly
// src/modules/bible/components/CharacterCard.svelte
import { activeSceneId } from '$modules/outliner/stores/outliner';
```

### Rule 3 — Route files are thin orchestrators

SvelteKit `+page.svelte` and `+layout.svelte` files are **orchestration surfaces only**. They:

- Import and compose module components
- Wire load data to component props
- Handle page-level layout concerns

They do **not** contain:

- Business logic (move to `services/`)
- Dexie queries beyond the `+page.ts` load function (move to service layer)
- More than one compound UI section without extracting into a component (move to `components/`)

**Target line budget for `+page.svelte` files: ≤ 80 lines.**

```svelte
<!-- ✅ ALLOWED — thin route orchestrator -->
<script lang="ts">
	import { ProjectCard } from '$modules/project';
	import { EmptyState } from '$lib/components';
	let { data } = $props();
</script>

{#if data.projects.length === 0}
	<EmptyState message="No projects yet" action="Create Project" />
{:else}
	{#each data.projects as project}
		<ProjectCard {project} />
	{/each}
{/if}
```

### Rule 4 — Components have a single visual responsibility

A Svelte component file should render **one coherent UI unit**. If a component needs a subcomponent that is only used by it, the subcomponent lives in the same module's `components/` folder.

**Decomposition trigger:** When a component template exceeds ~100 lines of markup, or when it conditionally renders more than two distinct visual states, extract into child components.

```text
// ✅ CORRECT decomposition
src/modules/bible/components/
├── CharacterList.svelte        # renders list of CharacterCard items
├── CharacterCard.svelte        # single character display unit
├── CharacterForm.svelte        # add/edit form
└── index.ts                    # re-exports all three
```

### Rule 5 — Services are pure domain logic

A `services/` file inside a module handles **all domain operations for that module** — Dexie queries, transformations, validations — but has no Svelte-specific code (`$state`, `$derived`, event dispatching). Services are plain TypeScript.

```ts
// ✅ CORRECT — pure TS service
// src/modules/bible/services/character-service.ts
import { db } from '$lib/db/db';

export async function getCharactersByProject(projectId: string) {
	return db.characters.where('projectId').equals(projectId).toArray();
}

export async function createCharacter(data: NewCharacter) {
	const id = crypto.randomUUID();
	await db.characters.add({ ...data, id, createdAt: Date.now() });
	return id;
}
```

### Rule 6 — Stores are scoped to their domain

Module-scoped reactive state lives inside the module at `src/modules/<domain>/stores/`. Only state that is genuinely consumed by **two or more unrelated modules** belongs in `src/lib/stores/`.

| State                                      | Correct location                   |
| ------------------------------------------ | ---------------------------------- |
| Which character is selected in Story Bible | `src/modules/bible/stores/`        |
| Which project is currently open            | `src/lib/stores/active-project.ts` |
| Whether the AI panel is open               | `src/lib/stores/ai-panel.ts`       |
| The active scene ID in the editor          | `src/modules/editor/stores/`       |

---

## Import Boundary Matrix

The table below defines which layers may import from which. ✅ = allowed, ❌ = forbidden.

| Importing from →                                    | `$lib/utils` | `$lib/db` | `$lib/stores`    | `$lib/components` | `$modules/<domain>` (public) | `$modules/<domain>` (internal) |
| --------------------------------------------------- | ------------ | --------- | ---------------- | ----------------- | ---------------------------- | ------------------------------ |
| **Route files (`+page.svelte`, `+layout.svelte`)**  | ✅           | ❌        | ✅               | ✅                | ✅                           | ❌                             |
| **Route load functions (`+page.ts`, `+layout.ts`)** | ✅           | ✅        | ❌               | ❌                | ✅ (services only)           | ❌                             |
| **Module components**                               | ✅           | ❌        | ✅ (`$lib` only) | ✅                | ❌                           | ✅ (own module)                |
| **Module services**                                 | ✅           | ✅        | ❌               | ❌                | ❌                           | ✅ (own module)                |
| **Module stores**                                   | ✅           | ✅        | ✅ (`$lib` only) | ❌                | ❌                           | ✅ (own module)                |
| **`$lib/ai/`**                                      | ✅           | ✅        | ❌               | ❌                | ❌                           | ❌                             |
| **Server routes (`+server.ts`)**                    | ✅           | ✅        | ❌               | ❌                | ✅ (services only)           | ❌                             |

---

## Enforced Tooling

### ESLint Import Boundaries (`eslint-plugin-boundaries`)

Install and configure `eslint-plugin-boundaries` in `eslint.config.js` to make boundary violations a lint error:

```sh
pnpm add -D eslint-plugin-boundaries
```

Minimum required rules to encode the matrix above:

```js
// eslint.config.js (excerpt)
import boundaries from 'eslint-plugin-boundaries';

export default [
	{
		plugins: { boundaries },
		settings: {
			'boundaries/elements': [
				{ type: 'route', pattern: 'src/routes/**' },
				{ type: 'lib', pattern: 'src/lib/**' },
				{ type: 'module', pattern: 'src/modules/*', capture: ['domain'] },
				{ type: 'store', pattern: 'src/lib/stores/**' },
				{ type: 'server', pattern: 'src/routes/api/**' },
			],
		},
		rules: {
			'boundaries/element-types': [
				'error',
				{
					default: 'disallow',
					rules: [
						{ from: 'route', allow: ['lib', 'store', [['module', { domain: '*' }]]] },
						{ from: 'module', allow: ['lib', 'store'] },
						{ from: 'server', allow: ['lib'] },
					],
				},
			],
		},
	},
];
```

### File Length Soft Limits

These are enforced culturally (code review) and optionally via a custom ESLint rule:

| File type                         | Warning threshold | Hard limit |
| --------------------------------- | ----------------- | ---------- |
| `+page.svelte` / `+layout.svelte` | 80 lines          | 150 lines  |
| `.svelte` component               | 150 lines         | 250 lines  |
| `services/*.ts`                   | 200 lines         | 400 lines  |
| `stores/*.ts`                     | 100 lines         | 200 lines  |
| `+server.ts`                      | 100 lines         | 200 lines  |

When a file exceeds the warning threshold, the implementing agent must either decompose it or add a comment block at the top explaining why consolidation is justified.

---

## Prohibited Patterns (Agent Reference)

The following patterns are hard violations. Any agent that produces them must refactor before marking a part complete.

| Pattern                                                                           | Why it's prohibited                                                  |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Business logic inside `+page.svelte` `<script>`                                   | Routes are orchestrators — logic belongs in services                 |
| Dexie queries outside `+page.ts`, service files, or `+server.ts`                  | Data access must be traceable and mockable                           |
| Importing `$env/static/private` anywhere except `+server.ts` files                | Security — env vars must never reach the client bundle               |
| A single `.svelte` file rendering navigation, content, and actions simultaneously | Violates SRP — extract into `Nav`, `Content`, `ActionBar` components |
| A `stores/` file that manages state for more than one domain                      | Signals a missing module boundary                                    |
| `components/` folder with more than ~10 files and no sub-grouping                 | Should be organized into subdirectories by responsibility            |
| A service function that also dispatches UI events or modifies Svelte state        | Services are pure TS — no Svelte primitives                          |

---

## Compliance Checklist (per Part)

Every part whose scope includes creating or modifying source files must verify:

- [ ] No `+page.svelte` file contains business logic or Dexie queries
- [ ] All new module components live inside their domain's `components/` folder
- [ ] All new services are plain TypeScript with no Svelte imports
- [ ] Cross-module communication uses only `$lib/stores/` or module `index.ts` public APIs
- [ ] No cross-module internal path imports
- [ ] `eslint-plugin-boundaries` reports zero violations (`pnpm run lint` passes)
- [ ] No file exceeds its warning threshold without a justification comment

---

## References

- [Vertical Slice Architecture — Jimmy Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- Repo layout: `dev-docs/repo-structure.md`
- Architecture overview: `dev-docs/architecture.md`
