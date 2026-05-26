---
part: part-001-entity-detail-surface
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

### [2026-04-25 19:55] Agent: [[Stylist Agent]]

Promoted `EntityDetailHeader` and `EntityHeaderPhoto` primitives in `src/lib/components/ui`
and migrated all six entity-specific detail headers to consume them while preserving
public API. Net reduction: 1500 → 632 LoC (–58%).

- New primitives:
  - [EntityDetailHeader.svelte](../../../../../../../src/lib/components/ui/EntityDetailHeader.svelte)
  - [EntityHeaderPhoto.svelte](../../../../../../../src/lib/components/ui/EntityHeaderPhoto.svelte)
- Migrated:
  [FactionDetailHeader](../../../../../../../src/modules/bible/components/FactionDetailHeader.svelte),
  [LineageDetailHeader](../../../../../../../src/modules/bible/components/LineageDetailHeader.svelte),
  [CharacterDetailHeader](../../../../../../../src/modules/bible/components/CharacterDetailHeader.svelte),
  [RealmDetailHeader](../../../../../../../src/modules/bible/components/RealmDetailHeader.svelte),
  [LandmarkDetailHeader](../../../../../../../src/modules/bible/components/LandmarkDetailHeader.svelte),
  [LoreEntryDetailHeader](../../../../../../../src/modules/bible/components/LoreEntryDetailHeader.svelte).
- Exported the new primitives from [src/lib/components/ui/index.ts](../../../../../../../src/lib/components/ui/index.ts).
- Visual rhythm now owned by a single canonical primitive; entity-specific class
  names removed. `LoreEntryDetailHeader` keeps a small local `.lore-type-badge`
  for its badge variant (only deliberate deviation).
- Gates: eslint clean on touched files; `pnpm run check` 0/0; `pnpm run check:tokens`
  247 files / 0 violations; `pnpm test --run` 39 files / 261 tests passing.
- Evidence: [evidence/entity-detail-header-convergence-2026-04-25.md](evidence/entity-detail-header-convergence-2026-04-25.md).
- Marking part `complete`. Part 002 (form surface) remains `draft` and requires a
  fresh implementation window — see the carry-forward note in the evidence file.
