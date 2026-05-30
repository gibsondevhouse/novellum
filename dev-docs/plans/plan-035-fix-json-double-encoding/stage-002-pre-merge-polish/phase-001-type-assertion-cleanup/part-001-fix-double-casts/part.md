---
title: Fix Double-Cast Type Assertions
slug: part-001-fix-double-casts
part_number: 1
status: draft
owner: Planner Agent
phase: phase-001-type-assertion-cleanup
---

## What

`GeneratedEntityModal.saveDraft` contains seven `as unknown as <Type>` double-casts (lines 214, 240, 256, 259, 276, 291, 307). These work around the fact that `draft` is typed `unknown` in the calling context. Each cast bypasses TypeScript completely, masking future type errors.

**File:** `src/modules/world-building/components/GeneratedEntityModal.svelte`

Lines 214, 240, 256, 259, 276, 291, 307 — pattern: `draft as unknown as WorldbuildXxxDraft` → `draft as WorldbuildXxxDraft`

Seven occurrences covering: `WorldbuildCharacterDraft`, `WorldbuildFactionDraft`, `WorldbuildLineageDraft`, `WorldbuildLocationDraft`, `WorldbuildLoreEntryDraft`, `WorldbuildPlotThreadDraft`, `WorldbuildTimelineEventDraft`.

## Why

- `as unknown as T` is a type escape hatch that completely nullifies TypeScript's structural checks
- Removing `unknown` restores the direct cast, which still isn't ideal but at least TypeScript can flag structural mismatches
- The `draft` variable holds a value already narrowed by the enclosing `if` / `switch` block — the intermediate `unknown` is unnecessary

## How

Search and replace in `GeneratedEntityModal.svelte`:

- Find: `as unknown as Worldbuild`
- Replace: `as Worldbuild`

Seven occurrences, no logic change.

## Acceptance Criteria

- [ ] Zero `as unknown as` patterns remain in `GeneratedEntityModal.svelte`
- [ ] `pnpm check` exits with zero errors after the change
- [ ] No runtime behavior changes (purely a type annotation fix)
