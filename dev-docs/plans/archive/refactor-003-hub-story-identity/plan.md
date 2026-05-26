---
title: Hub Story Identity Refactor
slug: refactor-003-hub-story-identity
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-18
stages:
  - stage-001-story-hero-composition
  - stage-002-structural-metrics-carousel
  - stage-003-hub-hierarchy-and-polish
dependencies:
  - plan-002-service-layer-and-state-hardening
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

Transform the Project Hub from a fragmented metadata form into a cohesive **story identity and structural visualization surface**. The hero section must foreground the book cover, title, logline, and synopsis as a unified composition. A structural metrics carousel beneath it visualises arc/act/chapter/scene depth at a glance. All lower sections are reordered and de-emphasised to keep editorial identity as the dominant first-screen experience.

## Context

The current `src/routes/projects/[id]/+page.svelte` puts a story-block (cover + logline only) in a left column beside a progress bar, and offloads action and metadata to a right column. The cover is a placeholder button. The synopsis is entirely absent from the Hub. No structural count metrics exist. The page still reads primarily as a project details form rather than a story command surface.

This refactor must not break the existing Dexie data layer, the project shell (`+layout.svelte`), or the shared edit modal (`EditProjectForm.svelte`). It replaces only the presentation layer inside `+page.svelte` and adds new modular components.

## Scope

**In scope:**

- New `ProjectHubHero` component tree (cover, title, genre tags, logline, full synopsis)
- Hero edit-mode: move inline form editing into a controlled modal or drawer; hero is presentation-first
- `HubMetricsService` — query arc, act, chapter, and scene counts from existing Dexie schema
- `StructuralMetricCard` — reusable dashboard primitive
- `StructuralMetricsCarousel` — horizontal scroll region beneath the hero
- Reorder Hub sections into the 5-layer hierarchy (hero → metrics → progress → next action → metadata)
- Responsive layout for desktop / tablet / mobile
- All components placed in `src/modules/project/components/` following modular-boundaries rules

**Out of scope:**

- Arc/act data model changes (metrics read from existing `chapters`, `scenes`, Dexie tables only for current sprint; `arcs` and `acts` tables wired when available)
- CRUD UI for arcs or acts
- Editing-layer features
- Any non-Hub routes

## Stages

| #   | Stage                                                                                   | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Story Hero Composition](stage-001-story-hero-composition/stage.md)                     | `draft` | 2d            |
| 002 | [Structural Metrics Carousel](stage-002-structural-metrics-carousel/stage.md)           | `draft` | 2d            |
| 003 | [Hub Hierarchy & Polish](stage-003-hub-hierarchy-and-polish/stage.md)                   | `draft` | 1d            |

## Quality Gates

All stages must pass the following gates before this plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` zero errors
- [ ] **typecheck** — `pnpm run check` zero errors
- [ ] **visual review** — Hub hero composition reviewed against acceptance criteria in a browser
- [ ] **responsive review** — desktop, tablet (768px), and mobile (375px) viewport screenshots in evidence
- [ ] **docs_sync** — `dev-docs/modules/project-hub.md` updated to reflect new component architecture

## Component map

| Component | File | Purpose |
| --- | --- | --- |
| `ProjectHubHero` | `src/modules/project/components/ProjectHubHero.svelte` | Outermost hero shell — two-column layout |
| `ProjectHeroCover` | `src/modules/project/components/ProjectHeroCover.svelte` | Cover image / placeholder with 2:3 ratio |
| `ProjectHeroContent` | `src/modules/project/components/ProjectHeroContent.svelte` | Right-column — title, genre, logline, synopsis |
| `ProjectHeroSynopsis` | `src/modules/project/components/ProjectHeroSynopsis.svelte` | Full synopsis block (no truncation) |
| `HubMetricsService` | `src/modules/project/services/hub-metrics-service.ts` | Count queries for arc/act/chapter/scene |
| `StructuralMetricCard` | `src/modules/project/components/StructuralMetricCard.svelte` | Reusable metric card primitive |
| `StructuralMetricsCarousel` | `src/modules/project/components/StructuralMetricsCarousel.svelte` | Horizontal scroll container for 4 cards |

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| `arcs` and `acts` tables do not yet exist in Dexie schema | high | `HubMetricsService` returns `0` with a `ready: false` flag for missing tables; metric card shows "–" gracefully |
| ProjectHubHero ≥150 lines | medium | Extract `ProjectHeroCover` and `ProjectHeroContent` as separate components; hero shell stays lean |
| CSS bleeding due to scoped style removal | low | All styles scoped to `.hub-hero` BEM namespace; verify with `pnpm run check` |
| Cover image storage not yet implemented | high | `ProjectHeroCover` renders a styled placeholder block; image upload is a future concern outside this plan's scope |

## Notes

- The existing `EditProjectForm.svelte` must remain functional — this refactor only changes where it is triggered from (modal context via `openEdit` from layout context, which already exists)
- `openEdit` is already injected via `getContext('projectActions')` in the current page; the hero components must forward this call rather than re-implement edit logic
- The `StructuralMetricCard` must be designed as a reusable primitive usable from other Hub surfaces (Outliner Hub, Story Bible Hub) in future iterations
- Font families, surface tokens, and spacing must exclusively use design-system tokens — no hardcoded values
