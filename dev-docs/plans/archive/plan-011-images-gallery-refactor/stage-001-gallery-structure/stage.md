---
title: Gallery Structure & Data Merging
slug: stage-001-gallery-structure
plan: plan-011-images-gallery-refactor
status: complete
---

## Objective

> Create a service layer capable of fetching all projects and sorting images by project.

## Implementation Details

1. Update `src/modules/assets/stores/assets.svelte.ts` to manage grouping assets by `projectId`.
2. Introduce fetching logic (via the `/api/db/projects` endpoint) to acquire the list of all projects.
3. Establish a standard unified store interface outputting `albums: { project?: Project; assets: Asset[] }[]`.

## Quality Gates

- [ ] Must use strictly Svelte 5 `$state` and `$derived` to construct the unified album arrays.
- [ ] Passing `pnpm run test` with line coverage > 80% on the updated store format.
- [ ] `eslint-plugin-boundaries` passes for imports.
