---
title: Inline Tools & Focus Modes
slug: part-001-inline-tools-and-focus-modes
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-editor-tools-and-modes
started_at: ~
completed_at: ~
estimated_duration: 1.5d
---

## Objective

Align editor inline tools, side panels, and focus / distraction-free modes with calm-surface rules.

## Scope

**In scope:**

- Bubble menus, slash menus, floating toolbars — visual restraint.
- Focus mode / distraction-free mode treatment.

**Out of scope:**

- Tiptap extension logic.

## Implementation Steps

1. Apply canonical rules to inline tool surfaces.
2. Verify focus mode calm-surface treatment.
3. Screenshot evidence.

## Files

**Update:**

- Inline tool and focus-mode components under `src/modules/editor/**`.

## Acceptance Criteria

- [ ] Inline tools defer to prose.
- [ ] Focus / distraction-free mode aligns with canonical calm surface.
- [ ] `tests/editor/**` still green.

## Edge Cases

- Tool tooltips must remain accessible.

## Notes

- None.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
