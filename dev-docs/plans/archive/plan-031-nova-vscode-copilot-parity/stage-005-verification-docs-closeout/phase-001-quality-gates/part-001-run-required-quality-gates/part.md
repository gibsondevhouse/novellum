---
title: Run Required Quality Gates
slug: part-001-run-required-quality-gates
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-quality-gates
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Run Required Quality Gates

## Objective

Run the required validation commands and store outputs or summaries in closeout evidence.

## Scope

**In scope:**

- Run the required validation commands and store outputs or summaries in closeout evidence.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Run `pnpm check`.
2. Run `pnpm lint`.
3. Run `pnpm lint:css`.
4. Run `pnpm test`.
5. Run `pnpm test:visual` or targeted Nova visual substitution with rationale.
6. Run `pnpm check:tokens`.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-005-verification-docs-closeout/phase-001-quality-gates/part-001-run-required-quality-gates/evidence/`

## Acceptance Criteria

- [ ] Each required command has recorded output or an accepted waiver.
- [ ] Failures are triaged to specific plan parts before closeout.
- [ ] No plan is marked complete with unexplained failing gates.

## Edge Cases

- If visual tests are environment-flaky, targeted substitution must include rationale and screenshot evidence.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
