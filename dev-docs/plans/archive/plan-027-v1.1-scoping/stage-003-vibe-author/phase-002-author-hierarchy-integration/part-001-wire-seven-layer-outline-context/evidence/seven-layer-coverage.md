# Seven-Layer Coverage Map

Documents how each of the seven canonical narrative layers is now threaded into the AI context pipeline for `vibe-author` tasks.

| # | Layer | Domain type | Repository fan-out | Surfaces in `AiContext.outlineHierarchy` |
| - | --- | --- | --- | --- |
| 1 | Arcs | `Arc` | `apiGet<Arc[]>('/api/db/arcs', { projectId })` | `outlineHierarchy.arcs` |
| 2 | Acts | `Act` | `apiGet<Act[]>('/api/db/acts', { projectId })` | `outlineHierarchy.acts` |
| 3 | Milestones | `Milestone` | `apiGet<Milestone[]>('/api/db/milestones', { projectId })` | `outlineHierarchy.milestones` (chapterIds canonicalized) |
| 4 | Chapters | `Chapter` | `apiGet<Chapter[]>('/api/db/chapters', { projectId })` | `outlineHierarchy.chapters` |
| 5 | Scenes | `Scene` | `apiGet<Scene[]>('/api/db/scenes', { projectId })` | `outlineHierarchy.scenes` |
| 6 | Beats | `Beat` | `apiGet<Beat[]>('/api/db/beats', { projectId })` | `outlineHierarchy.beats` |
| 7 | Stages | `Stage` | `apiGet<Stage[]>('/api/db/stages', { projectId })` | `outlineHierarchy.stages` (filterable by lifecycle status) |

## Normalization invariants

1. Every layer is sorted by `order` then `title` for stable AI prompts.
2. `Milestone.chapterIds` is sorted by the chapter's canonical position so out-of-order references normalize predictably.
3. Empty layers are always emitted as `[]`, never `undefined` — scenes with beats but no stages will not null-crash downstream consumers.
4. Input arrays are not mutated.

## Policy x family attachment matrix

| `contextPolicy` | `pipelineTask.family` | `outlineHierarchy` attached? |
| --- | --- | --- |
| `outline_scope` | (any, incl. none) | yes |
| `chapter_scope` | `vibe-author` | yes |
| `chapter_scope` | other / undefined | no |
| `continuity_scope` | `vibe-author` | yes |
| `continuity_scope` | `vibe-worldbuild` / other | no |
| `scene_only`, `scene_plus_adjacent` | (any) | no (scene-local prompts already scoped) |

This matrix is enforced in `src/lib/ai/context-engine.ts` and verified by `tests/ai/pipeline/context-hierarchy-mapping.test.ts`.
