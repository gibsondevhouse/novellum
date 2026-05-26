---
title: Dexie and KV Snapshot Service
slug: part-001-dexie-and-kv-snapshot-service
part_number: 1
status: draft
owner: backend
assigned_to: backend
phase: phase-002-snapshot-extraction-services
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build snapshot extraction services that produce a complete portable payload from Dexie tables and selected localStorage keys needed for continuity of planning fields.

## Scope

**In scope:**

- Extract all current Dexie tables into serializable arrays
- Extract localStorage keys by allowlisted prefixes used in outliner planning fields
- Exclude sessionStorage and ephemeral UI state
- Return deterministic snapshot object for ZIP assembly

**Out of scope:**

- ZIP compression
- Restore/import logic

## Implementation Steps

1. Create `src/modules/export/services/portability/snapshot-service.ts` with:
   - `buildDexieSnapshot()`
   - `buildKeyValueSnapshot()`
   - `buildPortabilitySnapshot()`

2. Include all Dexie tables from `src/lib/db/index.ts`:
   - projects, chapters, scenes, beats, characters, character_relationships
   - locations, lore_entries, plot_threads, timeline_events
   - consistency_issues, export_settings, scene_snapshots, story_frames, acts, arcs

3. Create key registry in `src/modules/export/services/portability/kv-registry.ts`:
   - include prefixes for outliner localStorage keys
   - exclude session keys like create form draft data

4. Add stable sorting rules for deterministic output (by id or order where available)

5. Add tests in `src/modules/export/services/__tests__/snapshot-service.test.ts`:
   - populated snapshot
   - empty DB snapshot
   - mixed localStorage keys with allowlist filtering

## Files

**Create:**

- `src/modules/export/services/portability/snapshot-service.ts`
- `src/modules/export/services/portability/kv-registry.ts`
- `src/modules/export/services/__tests__/snapshot-service.test.ts`

**Update:**

- `src/modules/export/index.ts` — export snapshot service

## Acceptance Criteria

- [ ] Snapshot includes all configured Dexie tables
- [ ] Snapshot includes required localStorage planning keys only
- [ ] Snapshot output is deterministic across repeated runs
- [ ] Tests verify filtering and table coverage
- [ ] `pnpm run check` exits clean

## Edge Cases

- localStorage unavailable due to browser privacy restrictions
- non-JSON legacy values in matching localStorage keys
- large table sizes with thousands of rows

## Notes

> Snapshot extraction is the single source of truth for portability payload generation. Do not duplicate extraction logic in export UI.
