---
title: Migrate Scribe Outline to Write
slug: part-001-migrate-scribe-outline-to-write
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-write-mode-pipeline-migration
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Migrate Scribe Outline to Write

## Objective

Move existing outline generation out of Scribe semantics and into Write mode without losing current functionality.

## Scope

**In scope:**

- Move existing outline generation out of Scribe semantics and into Write mode without losing current functionality.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Identify the current Scribe outline trigger and output path.
2. Replace regex-driven Scribe dispatch with Write-mode outline intent routing.
3. Wrap generated output as a proposal artifact, not an applied outline mutation.
4. Add tests for outline proposal generation from project logline/synopsis.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/pipeline/contracts.ts`

## Acceptance Criteria

- [x] Existing outline-generation capability remains reachable through Write mode.
- [x] Generated outline output is clearly marked as a proposal.
- [x] No generated outline is auto-applied to Project Hub, manuscript, or outline state.

## Edge Cases

- If required project context is missing, Write mode asks for missing inputs instead of fabricating.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
