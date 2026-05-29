---
title: Register Entity Read Tools
slug: part-002-register-entity-read-tools
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-read-only-project-tools
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Register Entity Read Tools

## Objective

Add read tools for scenes, characters, locations, and outline nodes using existing repositories and boundaries.

## Scope

**In scope:**

- Add read tools for scenes, characters, locations, and outline nodes using existing repositories and boundaries.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Define tools such as `read_scenes`, `read_characters`, `read_locations`, and `read_outline` or a single typed `read_project_entities` tool if that better matches existing code.
2. Keep outputs compact and filterable by IDs from attachments or model-selected criteria.
3. Return empty arrays with explanatory metadata, not thrown errors, for empty projects.
4. Add tests for zero, one, and multiple entity results.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/routes/api/db/*`

## Acceptance Criteria

- [ ] Agent mode can inspect core project entities through tool calls.
- [ ] No tool handler imports editor/manuscript mutation modules.
- [ ] Results are bounded and suitable for model context.

## Edge Cases

- Large entity lists should support summary/truncation metadata rather than dumping unbounded content.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
