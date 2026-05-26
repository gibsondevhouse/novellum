---
title: Workspace Surface Refactor
slug: refactor-005-workspace-surface
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-15
stages:
  - stage-001-data-and-state-foundation
  - stage-002-component-architecture
  - stage-003-page-integration-and-polish
dependencies:
  - refactor-004-navigation-and-structure
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

> Refactor the Workspace surface from its current outline-tree split-panel layout into a two-zone vertical architecture — a fixed hero zone with mode-cycling structural navigation, and a scrollable lower CRUD management zone — inheriting the same visual language, card system, and cinematic aesthetic established by the Hub.

## Scope

**In scope:**

- Create `Arc` database entity (type, schema v8 migration, repository, service)
- Workspace mode state management (Arcs / Acts / Chapters / Scenes cycling)
- Per-mode selected-item memory (switching modes preserves selection)
- `WorkspaceHeroShell` — fixed upper zone container
- `StructureModeSwitcher` — left/right arrow navigation between structural modes
- `WorkspaceHeroCard` — mode-adaptive hero card (arc/act/chapter/scene content)
- Hero empty states with polished CTAs
- `WorkspaceCollectionPane` — scrollable lower zone with hidden scrollbar
- `StructureCrudCard` — per-entity utility card (select, rename, delete)
- `CreateStructureCard` — smaller visually-subordinate creation affordance
- Rewrite of workspace `+page.svelte` and `+page.ts` route files
- Visual alignment with Hub design language (card chrome, spacing, typography)
- Fixed hero / independently scrolling collection layout

**Out of scope:**

- Drag-and-drop reordering (existing DnD preserved where it exists, no new DnD)
- Arc assignment to chapters/scenes (future feature)
- Beat-level editing (remains in existing components if needed)
- Tiptap editor integration
- Responsive / mobile breakpoints (desktop-first, can follow later)
- Changes to the Hub surface itself

## Stages

| #   | Stage                                                                                        | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Data & State Foundation](stage-001-data-and-state-foundation/stage.md)                      | `draft` | 1d            |
| 002 | [Component Architecture](stage-002-component-architecture/stage.md)                          | `draft` | 2d            |
| 003 | [Page Integration & Polish](stage-003-page-integration-and-polish/stage.md)                  | `draft` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass
- [ ] **visual** — workspace visually aligns with Hub card language

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Arc entity adds schema migration complexity | low | Dexie v8 bump is additive; v7→v8 migration is straightforward |
| Hero card height instability across modes | medium | Use `min-height` on hero shell; test all four modes + empty states |
| Existing outliner components become orphaned | low | Phase 3 audit ensures no dead imports; existing tests catch breaks |
| localStorage planning data (beats, etc.) lost | low | No localStorage data is deleted; components still exist |

## Notes

> The existing Workspace is implemented via the outliner module (`src/modules/workspace/` re-exports `src/modules/outliner/`). This refactor replaces the route-level presentation but retains the underlying outliner services and repositories. The new component tree lives under `src/modules/workspace/components/` to establish proper module boundaries.
>
> Arc is a new first-class entity. The existing `ArcRef` on Chapter/Scene remains for future arc-assignment features, but the `Arc` entity itself is created here with its own table, repository, and service layer.
>
> The workspace data loader (`+page.ts`) will fetch all four entity types (arcs, acts, chapters, scenes) upfront. The mode switcher only controls which subset is visible — no lazy loading per mode.
