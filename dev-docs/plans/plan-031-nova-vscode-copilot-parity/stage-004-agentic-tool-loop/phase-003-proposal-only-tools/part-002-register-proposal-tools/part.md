---
title: Register Proposal Tools
slug: part-002-register-proposal-tools
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-proposal-only-tools
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Register Proposal Tools

## Objective

Register `propose_outline_revision`, `propose_scene_draft`, and `propose_character_update` tools as proposal-only actions.

## Scope

**In scope:**

- Register `propose_outline_revision`, `propose_scene_draft`, and `propose_character_update` tools as proposal-only actions.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Implement proposal tools so they return proposal envelopes only.
2. Require explicit source context and missing-input reporting.
3. Ensure handlers cannot write to manuscript/editor/project repositories.
4. Add tests that proposal tools produce proposal artifacts from grounded context.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/lib/ai/pipeline/contracts.ts`

## Acceptance Criteria

- [ ] All three proposal tools are registered and callable by Agent mode.
- [ ] No proposal tool mutates persisted project state.
- [ ] Generated proposals include enough metadata for user review.

## Edge Cases

- Drafting first scene with zero scenes must create a proposal artifact, not a new scene record.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
