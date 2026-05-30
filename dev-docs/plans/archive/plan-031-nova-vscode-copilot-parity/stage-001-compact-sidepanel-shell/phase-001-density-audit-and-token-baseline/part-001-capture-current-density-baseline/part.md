---
title: Capture Current Density Baseline
slug: part-001-capture-current-density-baseline
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-density-audit-and-token-baseline
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Capture Current Density Baseline

## Objective

Record the current Nova sidepanel dimensions, spacing, greeting state, composer height, and constrained-width behavior so visual changes are evidence-driven.

## Scope

**In scope:**

- Record the current Nova sidepanel dimensions, spacing, greeting state, composer height, and constrained-width behavior so visual changes are evidence-driven.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Run the existing Nova visual specs or capture manual screenshots at 280px, 360px, and 520px panel widths.
2. Record current textarea min-height, send button size, panel padding, bubble padding, footer density, and greeting-card height.
3. Document visual defects as measurements, not subjective style notes.

## Files

**Create:**

- None expected.

**Update:**

- `tests/visual/editor-nova-panel*.test.ts`
- `test-results/`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/phase-001-density-audit-and-token-baseline/part-001-capture-current-density-baseline/evidence/`

## Acceptance Criteria

- [ ] Evidence includes at least one constrained-width screenshot or Playwright artifact.
- [ ] Baseline notes identify all concrete density deltas used by later parts.
- [ ] No production files are changed in this part unless required to enable the baseline run.

## Edge Cases

- Missing existing visual test should be recorded as a blocker and converted into a targeted baseline test in the next visual part.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
