---
title: Remove Pre-Encoding from GeneratedEntityModal
slug: part-001-remove-pre-encoding
part_number: 1
status: draft
owner: Planner Agent
phase: phase-001-remove-pre-encoding-and-guards
target_file: src/modules/world-building/components/GeneratedEntityModal.svelte
---

## Task

Remove all 13 inner `JSON.stringify()` wrappers on array fields in the `saveDraft()` function. The POST handler (`createPostHandler`) encodes these fields automatically, so clients must send raw arrays.

## Changes Required

File: `src/modules/world-building/components/GeneratedEntityModal.svelte` — `saveDraft()` function

| Entity Type | Fields to Fix | Lines | Count |
| --- | --- | --- | --- |
| `character` | `traits`, `goals`, `flaws`, `tags`, `aliases`, `anomalies`, `arcs` | ~224–234 | 7 |
| `realm` / `landmark` | `tags` | ~267 | 1 |
| `lore-entry` | `tags` | ~285 | 1 |
| `plot-thread` | `relatedSceneIds`, `relatedCharacterIds` | ~300–301 | 2 |
| `timeline-event` | `relatedCharacterIds`, `relatedSceneIds` | ~316–317 | 2 |

**Pattern change:**
```ts
// Before
tags: JSON.stringify(loc.tags || []),

// After
tags: loc.tags || [],
```

## Acceptance Criteria

- [ ] All 13 pre-encoding wrappers removed
- [ ] No syntax errors
- [ ] TypeScript strict mode: no errors
- [ ] `pnpm lint` passes
- [ ] Manual test: Create a realm via GeneratedEntityModal → tags appear in form without crashes
- [ ] Part marked `complete`

## Notes

- This change unblocks the Realms page freeze
- Safe to implement in isolation; backward compatible
- No behavior changes — only removes redundant encoding
