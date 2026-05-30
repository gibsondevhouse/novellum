---
title: Verify Global Acceptance Criteria
slug: part-002-verify-global-acceptance-criteria
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-quality-gates
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Verify Global Acceptance Criteria

## Objective

Walk the plan's global acceptance criteria against implementation evidence and record pass/fail status.

## Scope

**In scope:**

- Walk the plan's global acceptance criteria against implementation evidence and record pass/fail status.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Verify 360px compact density and single action row.
2. Verify Ask/Write/Agent mode behavior.
3. Verify attachment project/file flows and disclosure counts.
4. Verify Agent mode tool loop, cap, abort, chips, and proposal-only behavior.
5. Verify source-contract no-mutation import test result.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/checklist.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/validation-matrix.md`

## Acceptance Criteria

- [ ] Every global criterion is checked with evidence path or waiver.
- [ ] Known limitations are explicit and not hidden in impl logs.
- [ ] Critical acceptance criteria have no waiver unless the plan is blocked, not complete.

## Edge Cases

- If an acceptance criterion cannot be tested locally, create a manual verification evidence artifact.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
