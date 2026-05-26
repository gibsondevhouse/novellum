---
title: Setup Project Structure
slug: part-001-setup-project-structure
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-project-scaffolding-and-configuration
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 0.5d
---

## Objective

Scaffold the SvelteKit project and establish the canonical source directory layout that all modules will use throughout the plan.

## Scope

**In scope:**

- Running `pnpm create svelte@latest` with TypeScript and SvelteKit router options
- Creating the `src/` subdirectory structure: `app/`, `modules/`, `lib/`, `stores/`, `styles/`
- Adding barrel `index.ts` stubs for each top-level `src/` subdirectory

**Out of scope:**

- Installing application dependencies (Dexie, OpenRouter, etc.) — deferred to Phase 2
- Implementing any UI or business logic
- Configuring linting or formatting tools — deferred to Part 002

## Implementation Steps

1. From repo root, run: `pnpm create svelte@latest . --template skeleton --types ts --no-prettier --no-eslint --no-playwright --no-vitest`
2. Run `pnpm install` to install scaffold dependencies
3. Create the following directories under `src/`:
   - `src/app/` — SvelteKit route files and layout
   - `src/modules/project/` — Project Hub module
   - `src/modules/bible/` — Story Bible module
   - `src/modules/outliner/` — Outliner module
   - `src/modules/editor/` — Draft Editor module
   - `src/modules/ai/` — AI orchestration module
   - `src/lib/` — Shared utilities and clients
   - `src/stores/` — Svelte stores
   - `src/styles/` — Global CSS / design tokens
4. Add a `.gitkeep` to each empty directory so they are tracked by Git
5. Verify `pnpm run dev` starts without errors

## Files

**Create:**

- `src/app/` (directory)
- `src/modules/project/.gitkeep`
- `src/modules/bible/.gitkeep`
- `src/modules/outliner/.gitkeep`
- `src/modules/editor/.gitkeep`
- `src/modules/ai/.gitkeep`
- `src/lib/.gitkeep`
- `src/stores/.gitkeep`
- `src/styles/.gitkeep`

**Update:**

- `package.json` — verify `name`, `description` fields match Novellum

## Acceptance Criteria

- [ ] `pnpm install` completes with no errors
- [ ] `pnpm run dev` starts the SvelteKit dev server on `localhost:5173`
- [ ] All nine `src/` subdirectories exist and are tracked by Git
- [ ] TypeScript is enabled (`.svelte` files use `<script lang="ts">`)

## Edge Cases

- If the repo root already has a `package.json`, do not overwrite — inspect and merge scaffold output manually

## Notes

Use the `skeleton` SvelteKit template (minimal, no demo content). TypeScript strict mode (`"strict": true`) must be set in `tsconfig.json`.
