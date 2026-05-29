---
title: Record Plan-030 Constraint Lift
slug: part-001-record-plan-030-constraint-lift
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-constraint-lift-and-tool-contract
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Record Plan-030 Constraint Lift

## Objective

Document why plan-031 lifts plan-030's no-broad-tool-calling constraint and exactly how the lift is bounded.

## Scope

**In scope:**

- Document why plan-031 lifts plan-030's no-broad-tool-calling constraint and exactly how the lift is bounded.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Record that tools are Agent-mode only and opt-in per turn.
2. Record that read tools are pure functions over existing repositories.
3. Record that mutation-like tools return `ProposalEnvelope` and never auto-apply.
4. Record iteration cap and abort path as required implementation guardrails.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/plan.md`
- `dev-docs/plans/plan-030-nova-production-refactor/plan.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`

## Acceptance Criteria

- [ ] Plan-031 explicitly states the constraint lift and guardrails.
- [ ] Plan-030 stages 002 and 003 are marked superseded by plan-031 without reopening stage 001.
- [ ] Tracker snippets are updated for ACTIVE-PLAN and MASTER-PLAN.

## Edge Cases

- If plan-030 already closed, reconciliation must be additive notes, not rewriting historical implementation facts.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
