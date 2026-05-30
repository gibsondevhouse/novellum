---
title: Register Project Summary Tool
slug: part-001-register-project-summary-tool
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-read-only-project-tools
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Register Project Summary Tool

## Objective

Add a read-only tool for project metadata, logline, synopsis, planning notes, and baseline context summary.

## Scope

**In scope:**

- Add a read-only tool for project metadata, logline, synopsis, planning notes, and baseline context summary.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Define `read_project_summary` tool schema.
2. Route implementation through existing project/context services, not direct client DB access.
3. Return compact metadata and missing-field indicators.
4. Add tests for project with logline/synopsis and zero scenes.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/services/context-hooks.ts`

## Acceptance Criteria

- [ ] Tool returns project baseline context without requiring active scene.
- [ ] Tool is read-only and side-effect free.
- [ ] Result includes missing-field metadata instead of fabricating absent values.

## Edge Cases

- No active project should return a typed tool error the model can explain.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
