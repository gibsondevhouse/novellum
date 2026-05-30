---
title: Build Single Action Row Controls
slug: part-002-build-single-action-row-controls
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-003-composer-action-row
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Build Single Action Row Controls

## Objective

Consolidate attach, slash/tools slot, mode slot, model picker, and send into one compact action row.

## Scope

**In scope:**

- Consolidate attach, slash/tools slot, mode slot, model picker, and send into one compact action row.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Place `[+] [</>] [Mode] [Model] ... [Send]` controls in one row with responsive truncation.
2. Use 32px send/control sizing and remove decorative drop shadow from the send button.
3. Keep slash/tools slot inert or honestly labeled until Stage 004 backs it with behavior.
4. Verify tab order follows visual order and disabled send state is visible.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/ModelPickerDropdown.svelte`

## Acceptance Criteria

- [ ] Action row matches the target control topology.
- [ ] All buttons have accessible names and focus styles.
- [ ] The row remains usable at 280px width without horizontal scrolling.

## Edge Cases

- Long model names must truncate inside the picker trigger without hiding send.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
