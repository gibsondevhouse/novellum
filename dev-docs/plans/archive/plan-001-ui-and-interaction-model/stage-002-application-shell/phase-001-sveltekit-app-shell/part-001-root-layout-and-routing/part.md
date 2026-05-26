---
title: Root Layout & Routing
slug: part-001-root-layout-and-routing
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-sveltekit-app-shell
stage: stage-002-application-shell
estimated_duration: 1d
---

## Objective

Create the SvelteKit root layout and the full route tree so every module page has a valid URL, renders inside the app shell, and participates in SvelteKit's client-side navigation.

## Reference Docs

- [SvelteKit Routing](https://svelte.dev/docs/kit/routing)
- [SvelteKit Layouts](https://svelte.dev/docs/kit/routing#layout)
- [SvelteKit Page Options (SSR/CSR)](https://svelte.dev/docs/kit/page-options)
- Repo structure: `dev-docs/repo-structure.md`

## Implementation Steps

1. Create `src/routes/+layout.svelte`:
   - Two-column flex layout: `<Sidebar />` (fixed width) + `<main><slot /></main>` (flex-grow)
   - Import and apply `src/styles/tokens.css` here (single global import)
   - Apply `background-color: var(--color-slate)` to `<body>` via `:global(body)`

2. Create `src/routes/+layout.ts`:
   - Export `export const ssr = false;` (local-first app, no server rendering needed)
   - Export `export const prerender = false;`

3. Create route stubs — each file is a minimal `<script>` + heading only:
   - `src/routes/+page.svelte` — home page (project list, wired in stage-003)
   - `src/routes/projects/[id]/+layout.svelte` — per-project layout shell
   - `src/routes/projects/[id]/+page.svelte` — Project Hub shell
   - `src/routes/projects/[id]/bible/+page.svelte` — Story Bible shell
   - `src/routes/projects/[id]/outline/+page.svelte` — Outliner shell
   - `src/routes/projects/[id]/editor/+page.svelte` — Draft Editor shell

4. Add `src/routes/api/ai/+server.ts` stub that returns `{ ok: true }` (wired in stage-004).

## Acceptance Criteria

- [ ] Root layout renders without errors at `http://localhost:5173`
- [ ] All six routes are reachable by navigating directly to their URLs
- [ ] Client-side navigation (no full reload) confirmed via browser network tab
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
