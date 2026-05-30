---
title: Define Proposal Envelope Reuse
slug: part-001-define-proposal-envelope-reuse
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-proposal-only-tools
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Define Proposal Envelope Reuse

## Objective

Reuse or adapt the existing pipeline artifact envelope pattern for outline, scene, and character proposals.

## Scope

**In scope:**

- Reuse or adapt the existing pipeline artifact envelope pattern for outline, scene, and character proposals.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Inspect `PipelineArtifactEnvelope` and define the minimal `ProposalEnvelope` compatibility layer if needed.
2. Include proposal type, source context, generated content, confidence/limitations, and explicit apply requirements.
3. Avoid adding any field that implies automatic persistence.

## Files

**Create:**

- None expected.

**Update:**

- `src/lib/ai/pipeline/contracts.ts`
- `src/modules/nova/types.ts`
- `src/modules/nova/services/tool-router.ts`

## Acceptance Criteria

- [ ] Proposal payloads are machine-readable and UI-renderable.
- [ ] Proposal contract explicitly separates generated content from persisted state.
- [ ] Existing pipeline contracts are reused where feasible instead of duplicated.

## Edge Cases

- If pipeline envelope is incompatible, create a Nova-local adapter and document why.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
