# Route State Contract (2026-06-15)

## Implemented Contract

Plan-048 now has a pure route context helper in `src/lib/navigation-state.ts`:

- `deriveRouteContext(input)` maps a visible route to `workspace`, `projectId`, `activeChapterId`, `activeSceneId`, `worldbuildingPath`, `isProjectScoped`, and `novaSurface`.
- Project context is derived from the visible `/projects/[id]` pathname first.
- Stale `page.params.id` is ignored on non-project routes so store-derived context cannot silently disagree with `/settings`, `/nova`, `/books`, or other global surfaces.
- `sceneId` and `chapterId` query params remain supported for editor deep links and override route/page-data defaults.
- `worldbuildingPath` records the domain/category tail for worldbuilding sub-routes without inventing scene or chapter context.
- `/nova` is explicitly classified as `global-exploratory`; project-scoped routes classify Nova as `embedded-project`.

## Consumers

| Consumer | Contract use |
| --- | --- |
| `src/lib/stores/active-context.svelte.ts` | Uses `deriveRouteContext` for canonical project, chapter, and scene IDs. |
| `src/lib/stores/active-project.svelte.ts` | Uses the same contract for active project ID resolution. |
| `src/modules/nova/components/NovaPanel.svelte` | Uses route workspace classification for editor/worldbuilding/chapter subheader behavior. |
| `src/routes/+layout.svelte` | Continues to pass `activeContext.projectId`, `activeContext.sceneId`, and `activeContext.chapterId` into the global Nova panel. |

## Workspace Mapping

| Route family | Workspace | Project scoped | Nova surface |
| --- | --- | --- | --- |
| `/projects` | `projects` | no | `none` |
| `/projects/[id]` | `project-hub` | yes | `embedded-project` |
| `/projects/[id]/editor` and `/projects/[id]/editor/[sceneId]` | `editor` | yes | `embedded-project` |
| `/projects/[id]/outline` | `outline` | yes | `embedded-project` |
| `/projects/[id]/world-building/**` | `world-building` | yes | `embedded-project` |
| `/projects/[id]/continuity` | `continuity` | yes | `embedded-project` |
| `/projects/[id]/story-bible` | `story-bible` | yes | `embedded-project` |
| `/projects/[id]/arcs/**/chapters/[chapterId]` | `arcs` | yes | `embedded-project` |
| `/nova` | `nova` | no | `global-exploratory` |
| `/settings/**`, `/books`, `/stories`, `/images`, `/styles`, `/onboarding` | matching global workspace | no | `none` |

## Validation

Command:

```text
pnpm exec vitest run tests/lib/navigation-state.test.ts tests/lib/active-context.test.ts tests/nova/nova-panel.test.ts tests/nova/context-disclosure-pill.test.ts
```

Result:

```text
Test Files  4 passed (4)
Tests       30 passed (30)
```

The first run exposed the exact stale-route risk this stage was meant to catch: `activeContext.projectId` could use stale `page.params.id` on `/settings`. The helper now ignores params unless the visible pathname is project-scoped, and the targeted coverage is passing.
