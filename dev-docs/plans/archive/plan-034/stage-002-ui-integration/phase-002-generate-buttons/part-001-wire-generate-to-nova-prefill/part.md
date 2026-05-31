---
title: Wire Generate To Nova Prefill
slug: part-001-wire-generate-to-nova-prefill
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-generate-buttons
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `src/modules/world-building/worldbuilding-generate-actions.ts` with five per-domain `generate*WithNova()` functions that call `novaMode.loadForProject()`, `novaMode.setMode('write')`, and `novaPanel.openWithPrompt()` with the domain-specific prompt seed. Wire each function to the Generate button for its tile.

## Scope

**In scope:**

- `generatePersonaeWithNova(projectId)`, `generateAtlasWithNova(projectId)`, `generateArchiveWithNova(projectId)`, `generateThreadsWithNova(projectId)`, `generateChroniclesWithNova(projectId)`
- Each function reads its `promptSeedKey` from `WORLDBUILDING_DOMAIN_SEQUENCE` and the seed text from `PROMPT_SEEDS` in `prompt-library-seeds.ts`
- Wire each domain tile's Generate button `onclick` to the corresponding function
- No DB writes, no artifact creation — Nova prefill only

**Out of scope:**

- Disabled state logic (part-002)
- Readiness checks (part-003)
- Artifact creation or staging (stage-003)

## Implementation Steps

1. Create `src/modules/world-building/worldbuilding-generate-actions.ts`.
2. Import `novaMode` and `novaPanel` from `$modules/nova`.
3. Import `WORLDBUILDING_DOMAIN_SEQUENCE` and `PROMPT_SEEDS`.
4. Implement five functions — each reads its seed, calls `novaMode.setMode('write')`, and calls `novaPanel.openWithPrompt(seed.task)` with the seed's task text.
5. In `+page.svelte`, import and wire each function to the corresponding Generate button.
6. Run `pnpm check` and `pnpm lint`.
7. Record Nova opening with correct prompt in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/worldbuilding-generate-actions.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte` (wire generate button onclicks)

## Acceptance Criteria

- [ ] Five per-domain generate functions exported from the new module
- [ ] Clicking Generate on each tile opens Nova with the domain-specific prompt prefilled
- [ ] Nova opens in `write` mode
- [ ] Zero DB writes occur
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] Evidence shows Nova opening with correct prompt text

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
