---
title: Images Gallery Refactor
slug: plan-011-images-gallery-refactor
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-15
last_updated: 2026-04-15
target_completion: TBD
stages:
  - stage-001-gallery-structure
  - stage-002-book-covers-integration
  - stage-003-gallery-ui-polish
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

> Refactor the `/images` view into a structured photo gallery where images are logically organized into project-based albums. Include project book covers (`coverUrl`) natively in this gallery so that authors can view and manage all their graphical assets (including book covers) in one cohesive hub.

## Scope

**In scope:**

- Overhaul `src/routes/images/+page.svelte` to display an "Albums" view instead of a flat list of assets.
- Create an album for "Global Library" (images without a specific associated `projectId`).
- Create project-specific albums that combine `db.assets` (where `projectId = project.id`) and the project's own `coverUrl`.
- Display project `coverUrl` thumbnails as the primary album cover or as a prominent image inside its respective album.
- Use Svelte 5 syntax (`$state`, `$derived`, `.svelte.ts`) exactly, conforming to the Svelte 5 Runes standard required by the project.
- Verify adherence to `eslint-plugin-boundaries` checks (data logic goes to `/api/db/*` or service layer, no leakage).
- Require 80% line coverage testing for new service data operations regarding retrieving unified project+asset records.

**Out of scope:**

- Changing image upload processing (like cropping or adding compression pipelines).
- Non-image asset types.

## Stages

| #   | Stage                                                                          | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Gallery Structure & Data Merging](stage-001-gallery-structure/stage.md)       | `draft` | 1d            |
| 002 | [Book Covers & Album Support Setup](stage-002-book-covers-integration/stage.md)| `draft` | 1d            |
| 003 | [Gallery UI Polish & Implementation](stage-003-gallery-ui-polish/stage.md)     | `draft` | 1.5d          |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors (`pnpm run lint` must pass `eslint-plugin-boundaries` checks)
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass via `pnpm run test` (Services require 80% line coverage)

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Escaping boundary constraints when querying local DB for combined Project/Asset view | medium | Explicit server-side endpoints must be used alongside the correct FSD domain restrictions for shared entities. |
| Mixed visual standards between `coverUrl` and `assets` | low | Wrap both variations of images in a standardized preview component. |

## Notes

> All new UI component state for managing the gallery list must deeply utilize Svelte 5 reactivity (`$state()`, `$derived()`). The gallery component (`ImageGrid.svelte`) will likely need a parent container that iterates over albums before dispatching a filtered list.
