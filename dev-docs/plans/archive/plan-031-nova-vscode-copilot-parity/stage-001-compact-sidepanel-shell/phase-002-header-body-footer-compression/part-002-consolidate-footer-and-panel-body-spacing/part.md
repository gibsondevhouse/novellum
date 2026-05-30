---
title: Consolidate Footer and Panel Body Spacing
slug: part-002-consolidate-footer-and-panel-body-spacing
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-header-body-footer-compression
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Consolidate Footer and Panel Body Spacing

## Objective

Reduce panel body padding and footer noise so the message log and composer dominate the available height.

## Scope

**In scope:**

- Reduce panel body padding and footer noise so the message log and composer dominate the available height.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Reduce body padding toward the target `--space-3` density.
2. Replace verbose footer copy with a low-contrast one-line status bar.
3. Keep critical warnings visible; do not demote missing-key or no-project errors into decorative copy.
4. Validate scroll behavior with an empty conversation and a long conversation.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`

## Acceptance Criteria

- [ ] Footer consumes minimal vertical space while still communicating status.
- [ ] Message log has more usable vertical space at constrained widths.
- [ ] Empty, loading, error, and grounded states remain distinguishable.

## Edge Cases

- At 280px width, footer copy may truncate but must not overlap composer controls.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
