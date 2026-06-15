# Duplicate And Relationship Gap Map Evidence

Date: 2026-06-12
Part: `part-001-duplicate-and-relationship-gap-map`

## Source Anchors

- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts:124` - `buildProposalDedupeKey`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts:141` - `isDuplicateProposalKey`
- `src/routes/api/worldbuilding/scan/+server.ts:160` - domain-specific proposal identifiers
- `src/routes/api/worldbuilding/scan/+server.ts:386` - pending proposal key loading
- `src/routes/api/worldbuilding/scan/+server.ts:415` - exact canon key loading
- `src/routes/api/worldbuilding/scan/+server.ts:475` - scan proposal normalization and dedupe
- `src/lib/ai/pipeline/checkpoint-service.ts:478` - proposal projection
- `src/routes/api/db/character_relationships/+server.ts:7` - relationship API and duplicate pair guard
- `src/routes/api/db/locations/+server.ts:17` - location link-capable fields
- `src/routes/api/db/characters/+server.ts:18` - character link/identity fields
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte:68` - proposal review preview

## Exact Dedupe Limits

Current scan dedupe creates a key from `categoryId`, `entityKind`, and a normalized primary identifier. Normalization trims, lowercases, and collapses whitespace. It does not strip punctuation, compare aliases, compare descriptions, search existing row bodies, or account for cross-domain references.

Current key examples:

- `personae:character:elara voss`
- `atlas:location:glass delta`
- `archive:lore_entry:iron compact`
- `threads:plot_thread:succession crisis`
- `chronicles:timeline_event:the first sundering`

Current blockers:

- Pending scan proposals in project metadata for the same owner.
- Exact current canon names/titles for the selected scan domain.
- Duplicate keys produced within the same scan batch.

Not blocked:

- Accepted or rejected historical proposal keys.
- Canon changes that happen after scan persistence but before proposal accept.
- Near matches such as alternate punctuation, honorifics, aliases, reordered names, pluralization, translations, abbreviations, or acronym/title variants.
- Cross-family overlaps, such as a faction name matching a location name or a character named after a lore title.
- Semantic duplicates where different names describe the same person, place, thread, or event.

## Relationship And Link Gaps

| Family | Link-capable schema today | Current proposal/checkpoint projection gap |
| --- | --- | --- |
| Characters | `factionId`, `faction`, `character_relationships`, scene IDs indirectly through scenes | Proposal accept keeps `payload.factionId` only if supplied and never resolves faction names; checkpoint accept links `factionId` only to factions inserted earlier in the same payload; no accept path writes `character_relationships` |
| Factions | Faction rows can be referenced by character `factionId`, location `factionIds`, and prompt/context surfaces | Scan has no standalone faction proposal; personae scan writes only character faction text; no accept path links existing faction rows by name |
| Locations | `kind`, `realmId`, `landmarkIds`, `factionIds`, `characterIds`, `threadIds` | Proposal/checkpoint accept writes only generic `locations` rows without kind or link arrays; realm/landmark relationships are not projected |
| Lore entries | Core table has no explicit link arrays; richer myth/tradition/technology forms may track realm links outside this projection | Accept projection cannot relate lore to realms, factions, timelines, themes, glossary terms, or threads |
| Plot threads | `relatedSceneIds`, `relatedCharacterIds` in SQLite; richer thread-system payloads include realm/faction/arc/subplot link fields | Checkpoint projection can preserve related scene/character arrays; scan schema does not request them, and no accept path resolves names to IDs |
| Timeline events | `relatedCharacterIds`, `relatedSceneIds` in SQLite; chronicle system can track realm links outside this table | Checkpoint projection can preserve related arrays; scan schema does not request them, and no accept path resolves names to IDs |
| Themes | No explicit link table | Checkpoint projection creates standalone rows only; no relation to lore, characters, plot threads, or scenes |
| Glossary terms | No explicit link table | Checkpoint projection creates standalone rows only; no relation to lore, names, factions, or locations |
| Character relationships | Dedicated `character_relationships` table with normalized pair duplicate guard | Personae domain relationship payloads are not projected; world-bible relationships are normalized into plot-thread records instead |

## Duplicate False Negatives

These duplicate classes can currently pass dedupe and later insert new canon rows:

- Same entity with alternate casing plus punctuation changes beyond whitespace normalization.
- Alias/title variants, such as "Queen Mara", "Mara of the Ash Court", and "Mara".
- Faction/location homonyms where the same phrase is canonical in another domain.
- Characters whose `faction` text matches an existing faction row but no `factionId` is supplied.
- Locations representing an existing realm/landmark but proposed under a slightly different name.
- Plot threads/timeline events with different titles but overlapping description/date/related actors.
- Regenerated world-bible checkpoint rows; checkpoint projection has no dedupe at all.

## Duplicate False Positives

Exact name/title dedupe can also suppress useful proposals:

- Two different characters sharing a common name.
- Distinct places with repeated generic names, such as "South Gate" in separate realms.
- Reused lore titles where category/content distinguishes them.
- Recurring events with the same ceremonial title in different eras.

## Review Evidence Requirements

The Stage 002 diff contract should expose duplicate evidence without auto-merging. Minimum evidence needed for a reviewable decision:

- Candidate target id, table/family, display name/title, and current status where available.
- Match reason, such as exact key, alias match, token overlap, same faction/realm, date overlap, or shared related IDs.
- Confidence or score bucket that is clearly advisory.
- Field-level comparison for proposed values versus target values, including empty-current-field fills.
- Link evidence for suggested references, including unresolved names that need author confirmation.
- A decision shape that can represent create, update existing, merge into target, link only, or no-op.
- Audit output that records the selected decision and the evidence shown at review time.

## Stage 002 Implications

The first contract implementation should keep matching deterministic and cheap:

1. Preserve exact normalized dedupe as a baseline.
2. Add accept-time target lookup for the same project and target family.
3. Build candidate evidence from exact names/titles, same normalized tokens, existing faction/location names, and empty-field opportunities.
4. Keep fuzzy or vector retrieval out of the initial contract unless later evidence proves deterministic matching is insufficient.

This gap map completes the Stage 001 audit baseline for a typed, author-reviewable diff/merge contract.
