# Modular Boundaries

> Last verified: 2026-05-07

Novellum follows a **Vertical Slice Architecture (VSA)** with **Feature-Sliced Design (FSD)** influences and **Single Responsibility (SRP)** at the file level. Boundaries are enforced mechanically by [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) configured in [eslint.config.js](../../eslint.config.js).

## The five rules

### Rule 1 — Module internals are private

Anything inside `src/modules/<domain>/` that is not re-exported from that module's `index.ts` is **internal**. Internal files must not be imported from other modules or from `src/lib/`.

### Rule 2 — No sibling cross-imports

Modules talk to each other **only through public barrels**:

```ts
// ✅ allowed
import { OutlineWorkspace } from '$modules/outline';

// ❌ forbidden — bypasses the barrel
import { OutlineWorkspace } from '$modules/outline/components/OutlineWorkspace.svelte';
```

### Rule 3 — Routes are thin

`+page.svelte` and `+layout.svelte` files compose components and wire load functions. They contain **no business logic, no fetch logic, no validation**. Logic moves to a module service.

Aspirational line budget: ~80 lines per route file. ~250 lines per any source file. Treat as a smell threshold, not a hard limit.

### Rule 4 — Single responsibility per component

A Svelte component renders **one** thing. If it grows multiple concerns, split it into co-located children inside the module's `components/` folder.

### Rule 5 — Services are pure

Module `services/` files are framework-agnostic TypeScript. They:

- Do not import Svelte runes.
- Do not touch the DOM.
- Are unit-testable with Vitest in isolation.

## Standard module layout

```text
src/modules/<domain>/
├── components/      # Svelte components (only some re-exported)
├── services/        # Pure TS business logic (the API of the module)
├── stores/          # .svelte.ts rune stores (module-scoped state)
├── types.ts         # Domain types + Zod schemas
├── constants.ts     # Domain constants
├── utils/           # Optional helpers
├── evidence/        # Optional test artifacts
└── index.ts         # PUBLIC barrel — defines the module's API
```

Only the symbols re-exported from `index.ts` are part of the module's public API.

## Server-only boundary

Code under [src/lib/server/](../../src/lib/server/) is **server-only**. SvelteKit's bundler rejects any client-bundled file that imports from this path. Use `/api/*` endpoints + [src/lib/api-client.ts](../../src/lib/api-client.ts) instead.

## Endpoint export boundary

`+server.ts` files may export only:

- HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`, `fallback`).
- `config`.
- Identifiers prefixed with `_` (`_helper`, `_buildResponse`).

Postbuild validation rejects anything else. Helpers live in sibling modules (`http.ts`, etc.) and are imported.

## What this enforces in practice

- You can move an entire module to another repo by copying its folder + updating consumer imports.
- A reviewer can read one module without holding the rest of the system in their head.
- Refactors stay local: a service rewrite inside `editor/` cannot accidentally reshape `outline/`.
- Cross-cutting concerns (active project, AI panel) live in [src/lib/stores/](../../src/lib/stores/), not glued into a feature.

## See also

- [04-modules/](../04-modules/) — per-module reference.
- [system.md](./system.md) — where modules sit in the overall architecture.
