# Current Write Map Evidence

Date: 2026-06-12
Part: `part-001-current-write-map`

## Source Anchors

- `src/lib/ai/pipeline/checkpoint-service.ts:298` - `applyPopulatedBibleProjection`
- `src/lib/ai/pipeline/checkpoint-service.ts:478` - `applyProposalProjection`
- `src/lib/ai/pipeline/checkpoint-service.ts:717` - `acceptCheckpoint`
- `src/lib/ai/pipeline/checkpoint-service.ts:901` - `acceptProposalAtomically`
- `src/lib/ai/pipeline/checkpoint-service.ts:944` - `rejectProposalAtomically`
- `src/routes/api/worldbuilding/scan/+server.ts:160` - scan domain proposal configuration
- `src/routes/api/worldbuilding/scan/+server.ts:386` - pending proposal dedupe key loading
- `src/routes/api/worldbuilding/scan/+server.ts:415` - canon exact-name/title dedupe keys
- `src/routes/api/worldbuilding/scan/+server.ts:475` - proposal normalization and dedupe
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts:58` - proposal acceptance metadata
- `src/lib/server/db/schema.ts:66` - `characters`
- `src/lib/server/db/schema.ts:127` - `character_relationships`
- `src/lib/server/db/schema.ts:139` - `locations`
- `src/lib/server/db/schema.ts:168` - `lore_entries`
- `src/lib/server/db/schema.ts:179` - `plot_threads`
- `src/lib/server/db/schema.ts:191` - `timeline_events`
- `src/lib/server/db/schema.ts:340` - `factions`
- `src/lib/server/db/schema.ts:352` - `themes`
- `src/lib/server/db/schema.ts:363` - `glossary_terms`

## Projection Entry Points

| Entry point | Trigger | Canon mutation | Metadata mutation | Transaction boundary |
| --- | --- | --- | --- | --- |
| `acceptCheckpoint` + `applyPopulatedBibleProjection` | Generic checkpoint accept for populated world-bible checkpoint payloads with `tableWrites` | Inserts rows into up to 8 canon tables | Updates checkpoint lifecycle to `accepted`, writes artifact lifecycle, `acceptance`, clears `rejection`, and updates `updatedAt` | One SQLite transaction wraps checkpoint load, version/lifecycle checks, optional canon projection, and metadata row write |
| `acceptCheckpoint` without populated projection | Generic checkpoint accept for domain checkpoints or unsupported checkpoint payloads | No canon writes | Writes accepted checkpoint metadata with `projectedToCanon: false` | Same checkpoint transaction |
| `acceptProposalAtomically` + `applyProposalProjection` | Worldbuilding scan proposal accept | Inserts exactly one canon row for the proposal category | Updates proposal status to `accepted`, writes `acceptance`, clears `rejection` | One SQLite transaction wraps proposal load, pending-status check, projection, and proposal row write |
| `rejectProposalAtomically` | Worldbuilding scan proposal reject | No canon writes | Updates proposal status to `rejected`, writes `rejection`, clears `acceptance` | One SQLite transaction wraps proposal load, lifecycle checks, and proposal row write |

## Populated World Bible Checkpoint Writes

All checkpoint projection rows receive `id: crypto.randomUUID()`, `projectId`, `createdAt`, and `updatedAt`. Projection uses `INSERT INTO` only; there is no update, merge, delete, or existing-row lookup.

| Table | Source bucket | Required field | Written fields | Notable omissions |
| --- | --- | --- | --- | --- |
| `factions` | `writes.factions` | `name` | `id`, `projectId`, `name`, `type`, `description`, `mission`, `ideology`, timestamps | No duplicate detection; no relationship/link table writes |
| `themes` | `writes.themes` | `title` | `id`, `projectId`, `title`, `description`, `tensionPair`, `imagery`, timestamps | No merge into existing themes; no references from lore/characters |
| `glossary_terms` | `writes.glossary_terms` | `term` | `id`, `projectId`, `term`, `definition`, `pronunciation`, `category`, timestamps | No existing-term merge or alias tracking |
| `characters` | `writes.characters` | `name` | `id`, `projectId`, `name`, `role`, `bio`, `faction`, `factionId`, `traits`, `goals`, `flaws`, `notes`, `tags`, timestamps | Rich character schema fields default empty; no `character_relationships` writes; `factionId` only links to factions inserted earlier in the same checkpoint payload |
| `locations` | `writes.locations` | `name` | `id`, `projectId`, `name`, `description`, `tags`, timestamps | Rich location fields default empty; no realm/landmark/faction/character/thread links |
| `lore_entries` | `writes.lore_entries` | `title` | `id`, `projectId`, `title`, `category`, `content`, `tags`, timestamps | No link projection to themes, glossary, factions, places, or threads |
| `plot_threads` | `writes.plot_threads` | `title` | `id`, `projectId`, `title`, `description`, `status`, `relatedSceneIds`, `relatedCharacterIds`, timestamps | Character and scene IDs are accepted as payload arrays but not resolved or validated here |
| `timeline_events` | `writes.timeline_events` | `title` | `id`, `projectId`, `title`, `description`, `date`, `relatedCharacterIds`, `relatedSceneIds`, timestamps | Character and scene IDs are accepted as payload arrays but not resolved or validated here |

## Scan Proposal Writes

Scan proposals use domain-specific payload contracts from `DOMAIN_CONFIG` and only project one proposal at a time. Proposal projection also uses `INSERT INTO` only.

| Proposal category | Entity kind | Target table | Required identifier | Written fields | Projection target stored |
| --- | --- | --- | --- | --- | --- |
| `personae` | `character` | `characters` | `payload.name` | `id`, `projectId`, `name`, `role`, `bio`, `faction`, `factionId`, `traits`, `goals`, `flaws`, `notes`, `tags`, timestamps | `personae` |
| `atlas` | `location` | `locations` | `payload.name` | `id`, `projectId`, `name`, `description`, `tags`, timestamps | `atlas` |
| `archive` | `lore_entry` | `lore_entries` | `payload.title` | `id`, `projectId`, `title`, `category`, `content`, `tags`, timestamps | `archive` |
| `threads` | `plot_thread` | `plot_threads` | `payload.title` | `id`, `projectId`, `title`, `description`, `status`, `relatedSceneIds`, `relatedCharacterIds`, timestamps | `threads` |
| `chronicles` | `timeline_event` | `timeline_events` | `payload.title` | `id`, `projectId`, `title`, `description`, `date`, `relatedCharacterIds`, `relatedSceneIds`, timestamps | `chronicles` |

Scan proposals do not currently project `factions`, `themes`, or `glossary_terms` as standalone proposal categories. They also do not create relationship rows, even when domain generation payloads contain relationship-like structures.

## Duplicate Behavior

- Scan generation suppresses duplicates before persistence by exact normalized dedupe keys only: `categoryId`, `entityKind`, and the configured `name` or `title`.
- Dedupe input includes pending proposals for the project and exact current canon names/titles for the selected domain.
- Accepted and rejected proposal keys are not loaded as pending dedupe blockers.
- No dedupe check runs again at accept time, so canon can drift between scan and acceptance.
- Checkpoint projection performs no duplicate detection.
- Neither path performs fuzzy matching, alias matching, acronym matching, relationship-aware matching, or field-level similarity scoring.

## Acceptance Metadata

Checkpoint acceptance writes:

- `acceptedAt`
- `acceptedBy`
- `note`
- `projectionMode: 'atomic'`
- `projectedToCanon`
- `entityCounts`

Proposal acceptance writes:

- `acceptedAt`
- `acceptedBy: null`
- `projectionTarget`
- `projectedToCanon: true`

Reject paths write `rejectedAt`, `rejectedBy`, and `reason`, and do not mutate canon.

## Gaps For Diff/Merge Design

- No author-visible field diff exists before accept.
- The review card previews only summary metadata and a small payload subset; it does not show target row candidates or field-level effects.
- There is no canonical diff model for create/update/merge/link/no-op decisions.
- There is no audit ledger that records per-field before/after values or the final accepted merge decision.
- Relationship projection is absent: `character_relationships` exists in SQLite but is not populated by checkpoint or proposal acceptance.
- Proposal accept cannot link `personae` proposals to an existing faction by name; it only preserves `payload.factionId` when supplied.
- World-bible checkpoint character faction links only work for factions inserted in the same checkpoint projection.
- Richer worldbuilding schema fields are mostly dropped into database defaults, especially advanced character and location fields.

This map establishes the current insert-only baseline for the Plan-047 diff/merge contract.
