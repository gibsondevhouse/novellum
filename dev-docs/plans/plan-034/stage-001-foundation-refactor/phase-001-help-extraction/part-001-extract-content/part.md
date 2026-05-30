---
title: Extract Content
slug: part-001-extract-content
part_number: 1
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-help-extraction
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Extract the entire `sections` derived array from `src/routes/projects/[id]/world-building/+page.svelte` — which contains all domain help content (purpose, meaning, questions, pitfalls, signals, glossary) — into a typed constant exported from a new `worldbuilding-help-content.ts` file.

## Scope

**In scope:**

- Read the `sections` array in `+page.svelte` and copy it verbatim into a typed module
- Define `WorldbuildingHelpSection` and related interfaces
- Export `WORLDBUILDING_HELP_SECTIONS` constant
- Replace the inline array in `+page.svelte` with an import of that constant

**Out of scope:**

- Building the help panel or drawer components (part-002)
- Wiring any open/close button (part-003)
- Styling changes

## Implementation Steps

1. Read `src/routes/projects/[id]/world-building/+page.svelte` — identify the full `sections` `$derived` array (lines containing `id`, `label`, `tagline`, `purpose`, `meaning`, `questions`, `pitfalls`, `signals`, `glossary`, `entryHref`).
2. Create `src/modules/world-building/help/worldbuilding-help-content.ts`.
3. Define interfaces: `WorldbuildingHelpGlossaryEntry`, `WorldbuildingHelpSection`.
4. Export `WORLDBUILDING_HELP_SECTIONS` as a typed `readonly` array containing all five domain objects.
5. In `+page.svelte`, replace the inline `$derived([...])` sections array with `const sections = WORLDBUILDING_HELP_SECTIONS;` and add the import.
6. Run `pnpm check` — must be zero errors.
7. Save diff or `tsc --noEmit` output to `evidence/`.

## Files

**Create:**

- `src/modules/world-building/help/worldbuilding-help-content.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte` (replace inline sections array with import)

## Acceptance Criteria

- [ ] `WORLDBUILDING_HELP_SECTIONS` exported with full TypeScript interface coverage
- [ ] `+page.svelte` has zero inline help copy — all domain content imported
- [ ] `pnpm check` passes with zero type errors
- [ ] At least one artifact (diff or tsc output) added to `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
