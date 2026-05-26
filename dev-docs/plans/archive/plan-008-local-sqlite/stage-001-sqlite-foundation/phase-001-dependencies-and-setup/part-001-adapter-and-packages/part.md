---
title: Adapter and Package Installation
slug: part-001-adapter-and-packages
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-dependencies-and-setup
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Install `better-sqlite3` and `@sveltejs/adapter-node` and wire the adapter into `svelte.config.js` so the app builds as a Node.js server and the SQLite driver is available to server-side code.

## Scope

**In scope:**

- Install `better-sqlite3` (production dep)
- Install `@types/better-sqlite3` (devDep)
- Install `@sveltejs/adapter-node` (devDep)
- Update `svelte.config.js` to use `adapter-node`
- Add `NOVELLUM_DB_PATH` to `.env.example` (create if missing)
- Verify `pnpm dev` and `pnpm build` work after changes

**Out of scope:**

- Actual SQLite schema or DB code (next phase)
- Any route changes

## Implementation Steps

1. Run `pnpm add better-sqlite3`
2. Run `pnpm add -D @types/better-sqlite3 @sveltejs/adapter-node`
3. In `svelte.config.js`, replace `import adapter from '@sveltejs/adapter-auto'` with `import adapter from '@sveltejs/adapter-node'`
4. Remove any adapter-specific options that are not compatible with `adapter-node` (adapter-auto has none beyond defaults)
5. Create `.env.example` at project root with: `NOVELLUM_DB_PATH=./novellum.db`
6. Add `.env` to `.gitignore` if not already present (check first)
7. Run `pnpm dev` — confirm server starts
8. Run `pnpm check` — confirm zero type errors
9. Run `pnpm lint` — confirm zero lint errors

## Files

**Update:**

- `svelte.config.js` — swap adapter import and constructor

**Create:**

- `.env.example` — document `NOVELLUM_DB_PATH` environment variable

## Acceptance Criteria

- [ ] `better-sqlite3` appears in `package.json` `dependencies`
- [ ] `@types/better-sqlite3` and `@sveltejs/adapter-node` appear in `devDependencies`
- [ ] `svelte.config.js` imports and uses `@sveltejs/adapter-node`
- [ ] `pnpm dev` runs without errors
- [ ] `pnpm build` produces output in `build/` directory
- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors

## Edge Cases

- If `pnpm build` fails due to `better-sqlite3` trying to bundle into the client bundle, add it to `vite.config.ts` `build.rollupOptions.external` or use `noExternal: false`
- `better-sqlite3` must only be imported from `*.server.ts` files or SvelteKit `+server.ts` route files — never from components or client-side code

## Notes

> `@sveltejs/adapter-node` is required for production; during development `pnpm dev` uses Vite dev server which is agnostic to adapter choice.
