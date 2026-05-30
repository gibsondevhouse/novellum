---
title: Add Mode Routing Test Suite
slug: part-001-add-mode-routing-test-suite
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-mode-regression-tests
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Add Mode Routing Test Suite

## Objective

Create a focused test suite for Ask, Write, and Agent route selection and prompt behavior.

## Scope

**In scope:**

- Create a focused test suite for Ask, Write, and Agent route selection and prompt behavior.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Test Ask mode grounded chat path with no tools advertised.
2. Test Write mode proposal route for outline/scene/revision requests.
3. Test Agent mode guard or resolver handoff without executing tools yet.
4. Test invalid persisted mode fallback to Ask.

## Files

**Create:**

- `tests/nova/mode-routing.test.ts`

**Update:**

- `tests/ai/*`
- `tests/nova/*`

## Acceptance Criteria

- [x] Mode routing tests fail on old Chat/Scribe literals.
- [x] Ask and Write paths remain deterministic.
- [x] No test expects direct manuscript mutation.

## Edge Cases

- Mock AI responses must be deterministic and not depend on OpenRouter availability.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
