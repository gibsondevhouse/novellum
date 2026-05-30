---
title: Compress Header and Status Pill
slug: part-001-compress-header-and-status-pill
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-header-body-footer-compression
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Compress Header and Status Pill

## Objective

Move Nova header spacing and status copy into a compact, single-line hierarchy matching the sidepanel target.

## Scope

**In scope:**

- Move Nova header spacing and status copy into a compact, single-line hierarchy matching the sidepanel target.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Reduce header vertical padding from the current generous layout to compact token spacing.
2. Move subtitle/status copy into an inline low-contrast pill where appropriate.
3. Preserve no-key, no-project, grounded, and loading state clarity.
4. Verify header controls remain reachable by keyboard and screen reader labels remain accurate.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`

## Acceptance Criteria

- [ ] Header remains readable at 280px width without wrapping into a bulky block.
- [ ] Context disclosure remains visible or intentionally collapsed into a labeled affordance.
- [ ] No user-facing label says Copilot instead of Nova.

## Edge Cases

- Long project titles must truncate without hiding the active grounded/no-context state.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
