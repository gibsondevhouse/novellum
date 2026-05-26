# Worldbuilding Audit

Date: 2026-05-06
Auditor: Architect Agent (plan-018 stage-007)

## Surface Inventory

| # | Surface | Status | Path | Notes |
|---|---------|--------|------|-------|
| 1 | `story-bible` module | MISSING → STUB CREATED | `src/modules/story-bible/` | Stub created this session: barrel export + `StoryBiblePlaceholder` component |
| 2 | Story Bible route | MISSING → STUB CREATED | `src/routes/projects/[id]/story-bible/` | Stub route created this session; gated by `featureFlags.labsEnabled` |
| 3 | World Building hub route | EXISTS | `src/routes/projects/[id]/world-building/` | Landing page with full section navigation (Personae, Atlas, Chronicles, Threads) |
| 4 | Character management | EXISTS | `src/routes/projects/[id]/world-building/characters/` | Full CRUD: list, `[charId]/` detail, individuals sub-section, notes. Backed by `CharacterForm`, `CharacterCard`, `CharacterDossierShell`, `BiographyPanel`, `VoicePanel`, etc. |
| 5 | Location / world management | EXISTS | `src/routes/projects/[id]/world-building/locations/` | Realms, landmarks, maps, notes sub-routes. Components: `RealmDossierPane`, `LandmarkDossierPane`, `NarrativeLocationDossierShell` |
| 6 | Timeline surfaces | EXISTS | `src/routes/projects/[id]/world-building/timeline/` | Eras, key-events, personal-histories, notes sub-routes. `TimelineEventForm` component present |
| 7 | Faction / organization surfaces | PARTIAL | `src/routes/projects/[id]/world-building/factions/` | Route exists but no sub-routes (no `[factionId]/` detail). Components fully built: `FactionCoreIdentityPanel`, `FactionMembersPanel`, `FactionRelationshipPanel`, `FactionStoryFunctionPanel`, etc. |
| 8 | Magic / technology systems | EXISTS | `src/routes/projects/[id]/world-building/lore/technology/` | Part of the lore section. `TechnologyDossierPane`, `TechnologyEntryForm` components present |
| 9 | Notes / lore features | EXISTS | `src/routes/projects/[id]/world-building/lore/` | Full lore section: myths, notes, technology, traditions sub-routes. `LoreEntryForm`, `MythDossierPane`, `TraditionDossierPane` present |
| 10 | Story notes in editor panels | MISSING | — | `src/modules/editor/` has no references to lore, worldbuilding, or notes panels. No editor side-panel for worldbuilding context |
| 11 | Export includes worldbuilding data | PARTIAL | `src/modules/export/services/portability/snapshot-service.ts` | Portability snapshot includes `lore_entries`, `characters`, `locations`, `plot_threads`, `timeline_events` via Dexie tables. EPUB/DOCX manuscript export does not include worldbuilding narrative |
| 12 | Nova context includes worldbuilding data | PARTIAL | `src/modules/nova/services/chat-service.ts` | `loreEntries` is wired into `AiContext` and counted for context tokens. Stub tools exist for `worldbuilding.create-character` and `worldbuilding.update-location` (plan-022/023 stubs, not yet live) |

## Lineages Surface

| Surface | Status | Path | Notes |
|---------|--------|------|-------|
| Lineage / bloodline management | EXISTS | `src/routes/projects/[id]/world-building/lineages/` | Separate route under world-building. Components: `LineageCoreIdentityPanel`, `LineageMembersPanel`, `LineageRelationshipPanel`, `LineageInheritanceCulturePanel`, `LineageStoryFunctionPanel` |
| Plot threads / arcs | EXISTS | `src/routes/projects/[id]/world-building/plot-threads/` | major-arcs, motivations, sub-plots, notes sub-routes. `PlotThreadForm` component present |

## Summary

- **Total surfaces audited**: 12 primary + 2 supplemental
- **EXISTS**: 7 (world-building hub, characters, locations, timeline, lore, tech systems, notes/lore)
- **PARTIAL**: 3 (factions missing detail routes, export missing manuscript inclusion, Nova stubs not live)
- **MISSING → STUB CREATED**: 2 (story-bible module, story-bible route — both created this session)
- **MISSING**: 1 (editor panel worldbuilding notes — no in-editor lore/world sidebar)

## Gap Priorities

1. **Factions detail routes** — components exist but no `[factionId]/` sub-route. Blocks per-faction deep dives.
2. **Editor worldbuilding panel** — no in-context lore access during drafting. High editorial value.
3. **Export worldbuilding data** — manuscript export (EPUB/DOCX) does not include world bible. Portability backup does.
4. **Nova live worldbuilding tools** — stub tools registered; actual server-side tool execution not yet wired.
