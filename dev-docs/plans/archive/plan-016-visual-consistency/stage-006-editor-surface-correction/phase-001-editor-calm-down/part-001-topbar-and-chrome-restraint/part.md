---
title: Top Bar & Chrome Restraint
slug: part-001-topbar-and-chrome-restraint
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-editor-calm-down
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Strip dashboard-like weight from the editor top bar and demote ambient chrome so the writing surface reads as a manuscript.

## Scope

**In scope:**

- Editor top bar visual weight, contrast, and button density.
- Side panel chrome restraint.

**Out of scope:**

- Prose typography (in part 002).
- Tools / focus mode (phase 002).

## Implementation Steps

1. Apply canonical editor rules to the top bar.
2. Reduce side panel ambient chrome weight.
3. Screenshot evidence.

## Files

**Update:**

- Editor top bar / side panel components under `src/modules/editor/**`.

## Acceptance Criteria

- [ ] Top bar reads as restrained, author-facing.
- [ ] `tests/editor/**` still green.

## Edge Cases

- Autosave / status indicators remain visible but quiet.

## Notes

- Follow `.github/skills/editor/SKILL.md` and `.github/skills/tiptap-editor/SKILL.md`.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
