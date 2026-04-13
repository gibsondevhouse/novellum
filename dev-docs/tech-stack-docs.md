# Novellum — Tech Stack Official Documentation

Single authoritative index of official docs for every runtime, framework, library, tool, and quality standard used in Novellum.
Consult this file before searching the web or guessing API behavior.
Links verified 2026-04-12.

---

## Runtime — Node.js (>= 20.19)

- [API reference (latest)](https://nodejs.org/docs/latest/api/)
- [v20 LTS API reference](https://nodejs.org/docs/latest-v20.x/api/)
- [Changelog](https://github.com/nodejs/node/blob/main/CHANGELOG.md)

Key modules used in this project: `fs`, `path`, `crypto`, `process`, `esm`

---

## Package Manager — pnpm (>= 9)

- [Getting started / installation](https://pnpm.io/installation)
- [CLI reference](https://pnpm.io/pnpm-cli)
- [Workspace docs](https://pnpm.io/workspaces)
- [`pnpm-workspace.yaml` settings](https://pnpm.io/settings)
- [Feature comparison vs npm/yarn](https://pnpm.io/feature-comparison)

**Constraint:** Do not use `npm` or `yarn`. All install/run commands must use `pnpm`.

---

## Build Tool — Vite (bundled with SvelteKit)

- [Getting started](https://vite.dev/guide/)
- [Features](https://vite.dev/guide/features)
- [Config reference](https://vite.dev/config/)
- [Plugin API](https://vite.dev/guide/api-plugin)
- [Env variables and modes](https://vite.dev/guide/env-and-mode)
- [Building for production](https://vite.dev/guide/build)
- [Rollup options — manual chunks](https://vite.dev/config/build-options.html#build-rollupoptions)

**Build configuration:** `reportCompressedSize: true` is enabled. Manual chunk splitting separates `vendor-dexie`, `vendor`, `ai`, and `repositories` bundles for improved cache granularity across deployments.

---

## Frontend Framework — Svelte 5 + SvelteKit

### Svelte 5

- [Introduction / overview](https://svelte.dev/docs/svelte/overview)
- [Getting started](https://svelte.dev/docs/svelte/getting-started)
- [Runes (reactivity primitives)](https://svelte.dev/docs/svelte/runes)
- [`$state`](https://svelte.dev/docs/svelte/$state)
- [`$derived`](https://svelte.dev/docs/svelte/$derived)
- [`$effect`](https://svelte.dev/docs/svelte/$effect)
- [Template transitions](https://svelte.dev/docs/svelte/transition)
- [Keyed list animations](https://svelte.dev/docs/svelte/animate)

### SvelteKit Core

- [Introduction](https://svelte.dev/docs/kit/introduction)
- [Routing](https://svelte.dev/docs/kit/routing)
- [Loading data (`load` functions)](https://svelte.dev/docs/kit/load)
- [Form actions](https://svelte.dev/docs/kit/form-actions)
- [Page options (SSR/CSR/prerender)](https://svelte.dev/docs/kit/page-options)
- [Service workers](https://svelte.dev/docs/kit/service-workers)
- [Adapters](https://svelte.dev/docs/kit/adapters)
- [`adapter-auto` — automatic platform adapter](https://svelte.dev/docs/kit/adapter-auto)
- [Full API reference](https://svelte.dev/docs/kit)

### SvelteKit UX and Navigation APIs

- [`$app/navigation`](https://svelte.dev/docs/kit/$app-navigation)
- [Link options (`data-sveltekit-*`)](https://svelte.dev/docs/kit/link-options)
- [Snapshots](https://svelte.dev/docs/kit/snapshots)
- [Shallow routing](https://svelte.dev/docs/kit/shallow-routing)
- [Accessibility behaviors](https://svelte.dev/docs/kit/accessibility)

### Tooling

- [`svelte-check` — Svelte-aware diagnostics and type checking](https://svelte.dev/docs/svelte/cli#svelte-check)

Run via `pnpm check` (one-shot) or `pnpm check:watch` (watch mode). Catches type errors inside `.svelte` files that `tsc` alone cannot see.

**Constraints:**

- SvelteKit is the application shell. All routing, SSR config, and service worker setup must follow SvelteKit conventions. Do not introduce Next.js or Nuxt patterns.
- Favor native SvelteKit navigation primitives (`preloadData`, `preloadCode`, snapshots, shallow routing) before adding custom router behavior.
- Svelte compiler option `runes: true` is enforced globally in `svelte.config.js` for all non-`node_modules` files. Do not use legacy reactivity syntax (`$:`, `export let` stores) in this codebase.

---

## Language — TypeScript

- [Documentation home](https://www.typescriptlang.org/docs/)
- [Handbook — everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Type manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TSConfig reference](https://www.typescriptlang.org/tsconfig/)
- [Latest release notes (TS 6.0)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)

**Constraint:** Strict mode required. All entities and service interfaces must be fully typed. Never use `any` explicitly.

---

## Local Data Layer — Dexie.js (IndexedDB)

- [Getting started with Svelte](https://dexie.org/docs/Tutorial/Svelte)
- [Understanding the basics](https://dexie.org/docs/Tutorial/Understanding-the-basics)
- [API reference home](https://dexie.org/docs/API-Reference)
- [TypeScript guide](https://dexie.org/docs/Typescript)
- [`Version.stores()` — schema definition](<https://dexie.org/docs/Version/Version.stores()>)
- [`Version.upgrade()` — migrations](<https://dexie.org/docs/Version/Version.upgrade()>)
- [`Table` API](https://dexie.org/docs/Table/Table)
- [`WhereClause` — queries](https://dexie.org/docs/WhereClause/WhereClause)
- [`liveQuery()` — reactive queries](<https://dexie.org/docs/liveQuery()>)
- [`EntityTable` — strict entity typing](https://dexie.org/docs/EntityTable)
- [Compound indexes](https://dexie.org/docs/Compound-Index)
- [Best practices](https://dexie.org/docs/Tutorial/Best-Practices)
- [IndexedDB on Safari — known issues](https://dexie.org/docs/IndexedDB-on-Safari)

**Constraints:**

- Dexie is the only persistent store. No data leaves the device unless the user explicitly triggers cloud sync.
- Schema versioning is required for every schema change. Never modify a version that has already been deployed.

---

## AI Routing Layer — OpenRouter

- [Quickstart](https://openrouter.ai/docs/quickstart)
- [API reference overview (request/response schema)](https://openrouter.ai/docs/api-reference/overview)
- [Parameters (`temperature`, `max_tokens`, `top_p`, etc.)](https://openrouter.ai/docs/api-reference/parameters)
- [Streaming (SSE)](https://openrouter.ai/docs/api/reference/streaming)
- [Structured outputs (`response_format`)](https://openrouter.ai/docs/guides/features/structured-outputs)
- [Model routing (fallbacks, multi-model)](https://openrouter.ai/docs/guides/features/model-routing)
- [Provider routing / selection](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Supported models browser](https://openrouter.ai/models)
- [OpenAPI spec (YAML)](https://openrouter.ai/openapi.yaml)
- [OpenAPI spec (JSON)](https://openrouter.ai/openapi.json)
- [App attribution headers](https://openrouter.ai/docs/app-attribution)

**Constraints:**

- OpenRouter is the sole AI model gateway. Never call a provider (Anthropic, OpenAI, etc.) directly.
- All calls are stateless. Context must be constructed per request by the Context Engine.
- The API key must never be exposed to the client bundle. Use a server-side proxy or SvelteKit server route.
- Use `response_format: { type: 'json_schema', ... }` for all structured agent outputs.

---

## Linting and Static Analysis

### ESLint

- [ESLint docs](https://eslint.org/docs/latest/)
- [Flat config migration and usage](https://eslint.org/docs/latest/use/configure/configuration-files)

### TypeScript-ESLint

- [Getting started](https://typescript-eslint.io/getting-started/)
- [Rule reference](https://typescript-eslint.io/rules/)

### Svelte ESLint Plugin

- [eslint-plugin-svelte docs](https://sveltejs.github.io/eslint-plugin-svelte/)

### Import Boundary Enforcement

- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)

**Constraint:** Module boundary rules are part of quality gates. Cross-module imports must follow `dev-docs/modular-boundaries.md`.

### Prettier Integration

- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

Disables all ESLint formatting rules that conflict with Prettier. Applied last in the ESLint config so Prettier has final authority over style decisions.

---

## Formatting

- [Prettier docs](https://prettier.io/docs/en/)
- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)

---

## Testing and Test Runtime

- [Vitest guide](https://vitest.dev/guide/)
- [Vitest config](https://vitest.dev/config/)
- [Vitest coverage](https://vitest.dev/guide/coverage.html)
- [V8 coverage provider](https://vitest.dev/guide/coverage.html#coverage-providers)
- [JSDOM](https://github.com/jsdom/jsdom)
- [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB)

**Configuration:**

- Test environment: `jsdom` (configured in `vitest.config.ts`)
- Coverage provider: `v8` (via `@vitest/coverage-v8`)
- Minimum coverage threshold: **80% lines** enforced across `src/modules/**/services/**` and `src/lib/ai/**`
- Global test setup file: `tests/setup.ts` (shared mocks and environment bootstrap)
- Path alias: `$lib` → `src/lib` (mirrors SvelteKit's alias for consistency)

**Constraint:** New feature and refactor work must include tests or explicit rationale for why test coverage is not applicable.

---

## UX Performance Standards

### Core Web Vitals

- [Web Vitals overview](https://web.dev/vitals/)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [Optimize INP](https://web.dev/articles/optimize-inp)
- [Optimize CLS](https://web.dev/articles/optimize-cls)

**Constraints:**

- Performance quality bar for release readiness: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75.
- Evaluate with both field data (CrUX/RUM) and lab tooling (DevTools/Lighthouse).

---

## Accessibility Standards

- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [APG patterns index](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Treeview pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

**Constraints:**

- Keyboard and screen-reader behavior for custom widgets must follow APG role/state/keybinding requirements.
- Every routed page must have a unique title so SvelteKit route announcements remain useful.

---

## Modern Browser APIs for UI Polish

- [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

**Constraints:**

- All advanced transitions must use progressive enhancement and maintain functional fallback behavior.
- Respect reduced-motion preferences for all non-essential animation.

---

## Desktop Wrapper — Tauri v2 (future milestone, post-MVP)

- [What is Tauri?](https://v2.tauri.app/start/)
- [Prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Create a project](https://v2.tauri.app/start/create-project/)
- [Project structure](https://v2.tauri.app/start/project-structure/)
- [Frontend configuration — SvelteKit setup](https://v2.tauri.app/start/frontend/)
- [Plugin directory](https://v2.tauri.app/plugin/)
- [CLI reference](https://v2.tauri.app/reference/cli/)
- [v2 security audit report](https://github.com/tauri-apps/tauri/blob/dev/audits/Radically_Open_Security-v2-report.pdf)

**Constraint:** Tauri wraps the SvelteKit PWA for macOS/Windows/Linux. It is not part of MVP. Do not introduce Tauri-specific APIs into shared app logic.

---

## Quick Reference

| I need to know about...                      | Link                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| SvelteKit routing and layout files           | [Routing docs](https://svelte.dev/docs/kit/routing)                                                        |
| SvelteKit navigation APIs                    | [`$app/navigation`](https://svelte.dev/docs/kit/$app-navigation)                                           |
| SvelteKit preloading behaviors               | [Link options](https://svelte.dev/docs/kit/link-options)                                                   |
| SvelteKit state continuity across navigation | [Snapshots](https://svelte.dev/docs/kit/snapshots)                                                         |
| Shallow history-driven modals and overlays   | [Shallow routing](https://svelte.dev/docs/kit/shallow-routing)                                             |
| Svelte 5 runes and reactivity                | [Runes docs](https://svelte.dev/docs/svelte/runes)                                                         |
| IndexedDB schema definition                  | [`Version.stores()`](<https://dexie.org/docs/Version/Version.stores()>)                                    |
| Dexie reactive live queries                  | [`liveQuery()`](<https://dexie.org/docs/liveQuery()>)                                                      |
| OpenRouter request and response shape        | [API reference](https://openrouter.ai/docs/api-reference/overview)                                         |
| Choosing an AI model                         | [Models browser](https://openrouter.ai/models)                                                             |
| TypeScript strict config                     | [TSConfig `strict`](https://www.typescriptlang.org/tsconfig/#strict)                                       |
| Linting setup                                | [ESLint docs](https://eslint.org/docs/latest/)                                                             |
| Test framework and coverage                  | [Vitest guide](https://vitest.dev/guide/)                                                                  |
| Performance thresholds and measurement       | [Web Vitals](https://web.dev/vitals/)                                                                      |
| LCP optimization                             | [Optimize LCP](https://web.dev/articles/optimize-lcp)                                                      |
| INP optimization                             | [Optimize INP](https://web.dev/articles/optimize-inp)                                                      |
| CLS optimization                             | [Optimize CLS](https://web.dev/articles/optimize-cls)                                                      |
| WCAG requirement lookup                      | [WCAG 2.2 quickref](https://www.w3.org/WAI/WCAG22/quickref/)                                               |
| ARIA keyboard and role patterns              | [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)                                                  |
| Route and page transition animation API      | [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)                |
| Component-level responsive behavior          | [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)    |
| Motion accessibility guardrail               | [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |
| Svelte type checking (`.svelte` files)       | [`svelte-check` CLI](https://svelte.dev/docs/svelte/cli#svelte-check)                                      |
| SvelteKit adapter for deployment             | [`adapter-auto` docs](https://svelte.dev/docs/kit/adapter-auto)                                            |
| ESLint + Prettier conflict resolution        | [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)                               |
| Test coverage threshold and scope            | [Vitest coverage](https://vitest.dev/guide/coverage.html)                                                  |
