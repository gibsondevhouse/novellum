---
title: De-duplicate BeatFocus & Outliner Types
slug: part-001-dedup-beat-focus
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-outliner-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Consolidate `BeatFocus` (and any other duplicated outliner types/constants) into `src/modules/outliner/types.ts`, and update all consumer files to import from there.

## Scope

**In scope:**

- `BeatFocus` type (currently in 4 files: `outliner/types.ts`, `BeatCard.svelte`, `BeatDetailPanel.svelte`, `BeatFocusSelector.svelte`)
- Any outliner-specific constants scattered across components (beat statuses, stage statuses if not already in workspace)
- Outliner barrel (`src/modules/outliner/index.ts`) to re-export types

**Out of scope:**

- Workspace-level types (already extracted in prior work)
- Beat/Stage component refactoring

## Implementation Steps

1. Audit all outliner files for duplicated types/constants: `grep -rn 'BeatFocus' src/modules/outliner/`
2. Ensure `BeatFocus` is in `src/modules/outliner/types.ts` (may already be there)
3. Remove local `BeatFocus` definitions from `BeatCard.svelte`, `BeatDetailPanel.svelte`, `BeatFocusSelector.svelte`
4. Add `import type { BeatFocus } from '../types'` to each consumer
5. Check for other duplicated outliner types/constants and consolidate
6. Update `src/modules/outliner/index.ts` barrel to export `BeatFocus`

## Files

**Create:** None (types.ts already exists)

**Update:**

- `src/modules/outliner/types.ts` — ensure BeatFocus is here
- `src/modules/outliner/components/BeatCard.svelte` — remove local type, import
- `src/modules/outliner/components/BeatDetailPanel.svelte` — remove local type, import
- `src/modules/outliner/components/BeatFocusSelector.svelte` — remove local type, import
- `src/modules/outliner/index.ts` — add BeatFocus to barrel exports

## Acceptance Criteria

- [ ] `BeatFocus` defined in exactly one file
- [ ] All consumers import from `../types` or the barrel
- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 boundary violations
