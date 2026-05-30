---
title: Persist Last Mode Per Project
slug: part-002-persist-last-mode-per-project
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-mode-type-and-session-state
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Persist Last Mode Per Project

## Objective

Update Nova session state so the last selected mode is restored for the active project without cross-project bleed.

## Scope

**In scope:**

- Update Nova session state so the last selected mode is restored for the active project without cross-project bleed.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add per-project mode persistence using the existing session persistence pattern.
2. Default unknown or missing mode to Ask.
3. Clear or separate mode state when project context changes.
4. Add regression tests for two project IDs with different last-used modes.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/services/*`
- `tests/nova/mode-routing.test.ts`

## Acceptance Criteria

- [x] Mode selection survives panel close/reopen for the same project.
- [x] Mode selection does not leak from one project to another.
- [x] Invalid persisted values are safely normalized to Ask.

## Edge Cases

- No active project should use a stable default but should not write project-specific persistence.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
