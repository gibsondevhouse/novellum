---
title: Rename World Building Ctas
slug: part-001-rename-world-building-ctas
part_number: 1
status: draft
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-cta-refactor
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Rename `startWritingWithNova()` to `startWorldbuildWithNova()` in `src/routes/projects/[id]/world-building/+page.svelte`, update the button label from "Start Writing with Nova" to "Build World Bible with Nova", and update the prefilled prompt to be worldbuilding-scoped rather than outline-scoped.

## Scope

**In scope:**

- Rename function `startWritingWithNova` → `startWorldbuildWithNova`
- Update button label: "Start Writing with Nova" → "Build World Bible with Nova"
- Update the prefilled Nova prompt from the current outline-focused text to a worldbuilding-focused instruction
- Ensure the Nova mode remains `'write'` (do not change mode)

**Out of scope:**

- Any other CTA or button changes
- The per-domain Generate buttons (stage-002)
- Readiness copy (part-002)

## Implementation Steps

1. Open `src/routes/projects/[id]/world-building/+page.svelte`.
2. Find `function startWritingWithNova()` — rename to `startWorldbuildWithNova()`.
3. Update the button's `onclick` binding and label text.
4. Replace the existing Nova prompt string with a worldbuilding-scoped prompt that references the five domains: Personae, Atlas, Archive, Threads, Chronicles.
5. Run `pnpm check` and `pnpm lint`.
6. Save diff to `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [ ] Zero occurrences of `startWritingWithNova` remain in the worldbuilding route
- [ ] Button label is "Build World Bible with Nova" (or approved alternative)
- [ ] Nova prompt is worldbuilding-scoped (not outline-focused)
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] Diff in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
