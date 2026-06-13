# Entity Field Coverage Evidence

Date: 2026-06-12
Part: `part-001-entity-field-coverage`

## Source Anchors

- `src/lib/ai/pipeline/worldbuild-agent.ts:25` - generated worldbuilding draft interfaces
- `src/lib/ai/pipeline/worldbuild-agent.ts:360` - populated world-bible normalization into `tableWrites`
- `src/lib/ai/pipeline/worldbuild-agent.ts:474` - normalized `tableWrites` payload
- `src/lib/ai/pipeline/worldbuild-schemas.ts:83` - strict character draft schema
- `src/lib/ai/pipeline/worldbuild-schemas.ts:149` - domain personae schema
- `src/lib/ai/pipeline/worldbuild-schemas.ts:169` - domain atlas schema
- `src/routes/api/worldbuilding/generate/+server.ts:333` - one-click generation output schemas
- `src/routes/api/worldbuilding/scan/+server.ts:160` - scan proposal output schemas
- `src/modules/world-building/components/GeneratedEntityModal.svelte:214` - generated-entity save mapping
- `src/modules/world-building/components/CharacterForm.svelte:85` - character form fields
- `src/modules/world-building/components/RealmForm.svelte:110` - realm form fields
- `src/modules/world-building/components/LandmarkForm.svelte:122` - landmark form fields
- `src/lib/db/domain-types.ts:90` - worldbuilding domain entity interfaces

## Coverage Matrix

| Entity family | Generated/world-bible payload fields | Scan proposal fields | SQLite/UI fields | Current accept projection coverage |
| --- | --- | --- | --- | --- |
| Character | `name`, `role`, `bio`, `faction`, `coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, `speechPattern`, `traits`, `goals`, `flaws`, `tags`, `notes` | `name`, `role`, `bio`, `faction`, `traits`, `goals`, `flaws`, `tags`, `notes` | SQLite also supports identity, physical, psychological, voice, continuity, current-state, aliases, media, arcs, anomaly, and faction fields | Checkpoint and scan accept preserve only identity basics, faction text/id, list basics, notes, tags; checkpoint drops normalized rich character fields |
| Faction | `name`, `type`, `description`, `mission`, `ideology` | No standalone scan proposal category; personae scan may include faction text only | SQLite/API/UI support same five canonical fields | Populated checkpoint preserves all generated faction fields; scan personae accept only writes character faction text/id and does not create/update factions |
| Location / realm | World-bible locations normalize to `name`, `description`, `tags`; one-click realm generation also returns `realmType` | `name`, `description`, `tags` | SQLite/UI support `kind`, `realmType`, `realityRules`, `culturalBaseline`, `powerStructure`, `conflictPressure`, `storyRole`, `tone`, link arrays | Checkpoint/scan accept preserve only `name`, `description`, `tags`; realm typing and world-rule fields remain empty |
| Location / landmark | World-bible locations normalize to `name`, `description`, `tags`; one-click landmark generation also returns `realmId` | `name`, `description`, `tags` | SQLite/UI support `kind`, `realmId`, `environment`, `notableFeatures`, `purpose`, `activityType`, `emotionalTone`, `changeOverTime`, link arrays | Checkpoint/scan accept preserve only `name`, `description`, `tags`; landmark parent/link/spatial fields remain empty |
| Lore entry | `title`, `category`, `content`, `tags` | `title`, `category`, `content`, `tags` | SQLite/API support same core fields; separate myth/tradition/technology forms may carry extra structured metadata outside this projection table | Current accept projection preserves all core fields for this table |
| Plot thread | `title`, `description`, `status`, `relatedSceneIds`, `relatedCharacterIds` | `title`, `description`, `status`; payload may also carry related IDs if present | SQLite supports same core fields; thread-system UI has richer major-arc/subplot/motivation payloads outside the simple table shape | Checkpoint preserves related ID arrays; scan schema does not request them, so scan accept usually stores empty arrays |
| Timeline event | `title`, `description`, `date`, `relatedCharacterIds`, `relatedSceneIds` | `title`, `description`, `date`; payload may also carry related IDs if present | SQLite supports core fields plus domain type includes optional `category`; chronicle-system UI has richer era/key-event payloads outside the simple table shape | Checkpoint preserves related ID arrays; scan schema does not request them, so scan accept usually stores empty arrays |
| Theme | `title`, `description`, `tensionPair`, `imagery` | No standalone scan proposal category | SQLite/API support same four canonical fields | Populated checkpoint preserves all generated theme fields; scan cannot propose themes directly |
| Glossary term | `term`, `definition`, `pronunciation`, `category` | No standalone scan proposal category | SQLite/API support same four canonical fields | Populated checkpoint preserves all generated glossary fields; scan cannot propose glossary terms directly |
| Character relationship | Personae domain payload has `source`, `target`, `type`, `description`; world-bible relationship objects are normalized into plot-thread records | No scan relationship proposal category | SQLite/API support relationship rows with `characterAId`, `characterBId`, `type`, `status`, `description` | No accept path writes `character_relationships` today |

## Dropped Fields

These fields are available in generated or normalized data but are not written by the relevant accept projection:

- Character checkpoint projection drops `coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, and `speechPattern` even though world-bible normalization carries them.
- Realm/landmark projection drops `kind`, `realmType`, `realmId`, spatial fields, world-rule fields, narrative-role fields, and relationship arrays because populated world-bible normalization and scan proposals only produce the minimal location shape.
- Personae domain relationships are not projected into `character_relationships`.
- Thread motivations, atlas travel constraints, chronicle eras, and archive subtype structure are domain payload fields with no current canon projection.

## Intentionally Ignored Or Not Yet In Scope

These are not treated as accidental projection drops for the initial merge design:

- Character physical appearance, current-state, continuity, scratchpad/media, aliases, anomalies, and arc arrays are editable in UI or present in SQLite but are not requested by current scan proposal schemas or populated world-bible normalization.
- Myth/tradition/technology extended fields, chronicle system extended fields, and thread-system extended fields are maintained by separate worldbuilding surfaces and are not represented in the simple canonical proposal payload today.
- Lineages are stored in project metadata rather than the canon SQLite tables covered by current proposal/checkpoint projection.
- Provider scan context intentionally includes compact canon identifiers only; the full current row is not sent to the model for scan generation.

## Initial Merge Target Recommendation

1. Characters should be the first merge target. They have exact current projection support, richer generated fields that are currently dropped, existing UI/API fields, and high duplicate risk from personae scans.
2. Locations should be the second merge target. They are already split by UI behavior into realms and landmarks, but projection currently collapses both into generic location rows with no `kind`, parent realm, or relationship fields.
3. Factions should be linked as part of character merge support before standalone faction diffing. This prevents personae accepts from creating unlinked faction text while a matching faction row already exists.
4. Lore entries, plot threads, and timeline events can start with create/update field diffs after character/location merge behavior is proven. Their core projection fields are smaller and less lossy today.
5. Themes, glossary terms, and character relationships should be added once the diff contract can express secondary/link operations.

This separates true data loss from fields intentionally outside the current proposal payload and defines the smallest useful merge surface for Stage 002.
