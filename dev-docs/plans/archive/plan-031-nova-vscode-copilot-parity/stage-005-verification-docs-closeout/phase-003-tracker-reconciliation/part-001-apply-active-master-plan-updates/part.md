---
title: Apply ACTIVE/Master Plan Updates
slug: part-001-apply-active-master-plan-updates
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-tracker-reconciliation
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Apply ACTIVE/Master Plan Updates

## Objective

Update plan trackers so plan-031 is active and plan-030 stage 002/003 ownership drift is closed.

## Scope

**In scope:**

- Update plan trackers so plan-031 is active and plan-030 stage 002/003 ownership drift is closed.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Apply the ACTIVE-PLAN snippet from this package or equivalent repo-current edit.
2. Add plan-031 to MASTER-PLAN Active Plans while retaining plan-030 closeout history.
3. Add supersession note for plan-030 stages 002 and 003.
4. Confirm plan-030 stage 001 is not accidentally superseded.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `dev-docs/plans/plan-030-nova-production-refactor/plan.md`

## Acceptance Criteria

- [ ] Trackers point to plan-031 as current active Nova plan.
- [ ] Plan-030 stage 002/003 are marked superseded by plan-031, not silently overwritten.
- [ ] No stale tracker row says plan-030 owns work now governed by plan-031.

## Edge Cases

- If MASTER-PLAN has changed since this package was generated, apply snippets manually rather than replacing the whole file.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
