---
title: Define Write Sub-Action Contract
slug: part-002-define-write-subaction-contract
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-write-mode-pipeline-migration
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Define Write Sub-Action Contract

## Objective

Document and minimally encode supported Write actions: Outline, Scene, and Revision, without building a bulky UI picker unless already cheap.

## Scope

**In scope:**

- Document and minimally encode supported Write actions: Outline, Scene, and Revision, without building a bulky UI picker unless already cheap.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Define supported Write sub-actions and required inputs.
2. Decide whether sub-actions are chip hints or resolver-only for this plan; default to compact chip hints under active Write mode if low-risk.
3. Ensure unsupported sub-actions return an explicit unsupported result.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/types.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `dev-docs/04-modules/nova.md`

## Acceptance Criteria

- [x] Write mode contract is explicit in code and docs.
- [x] Outline, Scene, and Revision are the only named Write actions unless a later plan expands them.
- [x] Unsupported generation requests do not silently route to generic chat.

## Edge Cases

- Scene drafting with zero scenes is allowed only as a proposal artifact based on project metadata.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
