# UI Surface Registry

> Exhaustive inventory of every `+page*` and `+layout*` surface in `src/routes/**`.
> Date: 2026-04-14

## Surface Inventory

| ID | Route | File Type | Route Family | Surface Role |
|---|---|---|---|---|
| S-001 | `/` | +page.svelte | Library | Home / Literary Library landing |
| S-002 | `/` | +page.ts | Library | Home data loader |
| S-003 | `/` | +layout.svelte | Root | Global app shell (sidebar + main) |
| S-004 | `/` | +layout.ts | Root | App-level config (ssr=false) |
| S-005 | `/` | +error.svelte | Root | Global error boundary |
| S-006 | `/books` | +page.svelte | Library | Books shelf listing with create |
| S-007 | `/books/[id]` | +page.svelte | Reader | Individual book reader view |
| S-008 | `/books/[id]` | +page.ts | Reader | Book detail loader |
| S-009 | `/stories` | +page.svelte | Library | Stories collection (coming-soon) |
| S-010 | `/projects/[id]` | +layout.svelte | Project Core | Project shell with modals |
| S-011 | `/projects/[id]` | +layout.ts | Project Core | Project layout loader |
| S-012 | `/projects/[id]` | +page.ts | Project Core | Project redirect (→ hub) |
| S-013 | `/projects/[id]/hub` | +page.svelte | Project Core | Project dashboard with metrics |
| S-014 | `/projects/[id]/hub` | +page.ts | Project Core | Hub data loader |
| S-015 | `/projects/[id]/workspace` | +page.svelte | Project Core | Story structure workspace |
| S-016 | `/projects/[id]/workspace` | +page.ts | Project Core | Workspace data loader |
| S-017 | `/projects/[id]/editor` | +page.svelte | Editor | Scene list + editor panel |
| S-018 | `/projects/[id]/editor` | +page.ts | Editor | Editor data loader |
| S-019 | `/projects/[id]/editor/[sceneId]` | +page.svelte | Editor | Scene detail editor |
| S-020 | `/projects/[id]/editor/[sceneId]` | +page.ts | Editor | Scene detail loader |
| S-021 | `/projects/[id]/outline` | +page.svelte | Project Core | Hierarchical outline navigator |
| S-022 | `/projects/[id]/outline` | +page.ts | Project Core | Outline loader |
| S-023 | `/projects/[id]/continuity` | +page.svelte | Analysis | Consistency checks + tabs |
| S-024 | `/projects/[id]/continuity` | +page.ts | Analysis | Continuity data loader |
| S-025 | `/projects/[id]/consistency` | +page.svelte | Analysis | Consistency engine view |
| S-026 | `/projects/[id]/consistency` | +page.ts | Analysis | Consistency redirect/loader |
| S-027 | `/projects/[id]/arcs` | +page.svelte | Project Core | Arc listing |
| S-028 | `/projects/[id]/arcs/[arcId]` | +page.svelte | Project Core | Arc detail |
| S-029 | `/projects/[id]/bible` | +page.svelte | Knowledge | Bible hub (redirect) |
| S-030 | `/projects/[id]/bible` | +page.ts | Knowledge | Bible redirect loader |
| S-031 | `/projects/[id]/bible/characters` | +page.svelte | Knowledge | Characters CRUD & listing |
| S-032 | `/projects/[id]/bible/characters` | +page.ts | Knowledge | Characters loader |
| S-033 | `/projects/[id]/bible/characters/[charId]` | +page.svelte | Knowledge | Character detail |
| S-034 | `/projects/[id]/bible/characters/[charId]` | +page.ts | Knowledge | Character detail loader |
| S-035 | `/projects/[id]/bible/lore` | +page.svelte | Knowledge | Lore page |
| S-036 | `/projects/[id]/bible/lore` | +page.ts | Knowledge | Lore loader |
| S-037 | `/projects/[id]/bible/timeline` | +page.svelte | Knowledge | Timeline view |
| S-038 | `/projects/[id]/bible/timeline` | +page.ts | Knowledge | Timeline loader |
| S-039 | `/projects/[id]/world-building/characters` | +page.svelte | Knowledge | WB characters listing |
| S-040 | `/projects/[id]/world-building/characters` | +page.ts | Knowledge | WB characters loader |
| S-041 | `/projects/[id]/world-building/characters/[charId]` | +page.svelte | Knowledge | WB character detail |
| S-042 | `/projects/[id]/world-building/characters/[charId]` | +page.ts | Knowledge | WB character detail loader |
| S-043 | `/projects/[id]/world-building/plot-threads` | +page.svelte | Knowledge | Plot threads listing |
| S-044 | `/projects/[id]/world-building/plot-threads` | +page.ts | Knowledge | Plot threads loader |
| S-045 | `/projects/[id]/world-building/timeline` | +page.ts | Knowledge | WB timeline loader |
| S-046 | `/projects/[id]/world-building` | +page.svelte | Knowledge | WB hub page |
| S-047 | `/settings` | +page.svelte | Utility | Settings hub |
| S-048 | `/settings/migrate` | +page.svelte | Utility | Data migration utility |
| S-049 | `/styles` | +page.svelte | Utility | Design system showcase |
| S-050 | `/styles` | +page.ts | Utility | Styles loader |
| S-051 | `/nova` | +page.svelte | Utility | Nova AI interface |
| S-052 | `/nova` | +page.ts | Utility | Nova loader |
| S-053 | `/images` | +page.svelte | Utility | Image gallery/assets |
| S-054 | `/images` | +page.ts | Utility | Images loader |
| S-055 | `/projects/[id]` | +error.svelte | Project Core | Project error boundary |
| S-056 | `/projects/[id]` | +page.svelte | Project Core | Redirect stub (→ hub) |
| S-057 | `/projects/[id]/bible/locations` | +page.svelte | Knowledge | Redirect stub (→ WB locations) |
| S-058 | `/projects/[id]/bible/locations` | +page.ts | Knowledge | Redirect loader (→ WB locations) |
| S-059 | `/projects/[id]/bible/plot-threads` | +page.svelte | Knowledge | Redirect stub (→ WB plot-threads) |
| S-060 | `/projects/[id]/bible/plot-threads` | +page.ts | Knowledge | Redirect loader (→ WB plot-threads) |
| S-061 | `/projects/[id]/world-building` | +page.ts | Knowledge | WB hub loader |
| S-062 | `/projects/[id]/world-building/locations` | +page.svelte | Knowledge | Locations CRUD & listing |
| S-063 | `/projects/[id]/world-building/locations` | +page.ts | Knowledge | Locations loader |
| S-064 | `/projects/[id]/world-building/lore` | +page.svelte | Knowledge | Lore entries CRUD & listing |
| S-065 | `/projects/[id]/world-building/lore` | +page.ts | Knowledge | Lore entries loader |
| S-066 | `/projects/[id]/world-building/timeline` | +page.svelte | Knowledge | Timeline event visualization |

## Route Family Summary

| Family | Surfaces | Visual Pages | Loaders/Redirects |
|---|---|---|---|
| Root | 3 | 1 (error) | 2 (layout) |
| Library | 3 | 3 | 0 |
| Reader | 2 | 1 | 1 |
| Project Core | 14 | 7 | 7 |
| Editor | 4 | 2 | 2 |
| Analysis | 4 | 2 | 2 |
| Knowledge | 28 | 12 | 16 |
| Utility | 8 | 5 | 3 |
| **Total** | **66** | **33** | **33** |
