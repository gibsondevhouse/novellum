---
title: Run and Record Compact Shell Visuals
slug: part-001-run-and-record-compact-shell-visuals
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-visual-baseline-rebaseline
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Run and Record Compact Shell Visuals

## Objective

Rebaseline Nova visual coverage once after shell density changes and store closeout evidence.

## Scope

**In scope:**

- Rebaseline Nova visual coverage once after shell density changes and store closeout evidence.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Run targeted Nova visual tests at the compact shell milestone.
2. Rebaseline only intentional compact shell differences.
3. Record command output and screenshot paths in evidence.
4. Flag any unrelated visual churn as a blocker before Stage 002 starts.

## Files

**Create:**

- None expected.

**Update:**

- `tests/visual/editor-nova-panel*.test.ts`
- `test-results/`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/**/evidence/`

## Acceptance Criteria

- [ ] Visual baselines reflect intentional compact shell changes only.
- [ ] Evidence records test command, result summary, and any baseline update rationale.
- [ ] Stage 001 can be treated as visually locked for later behavior work.

## Edge Cases

- If full visual suite is unstable, run targeted Nova specs and document why the substitution is acceptable.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
