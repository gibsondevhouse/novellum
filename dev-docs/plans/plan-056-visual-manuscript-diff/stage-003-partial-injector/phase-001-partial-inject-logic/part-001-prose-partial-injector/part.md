---
title: Prose Partial Injector Service
slug: part-001-prose-partial-injector
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-partial-inject-logic
started_at: ~
completed_at: ~
estimated_duration: undefined
---

## Objective

Connect highlighted range selections in UI to editor inputs.

## Scope

**In scope:**

- Identify selected paragraphs.
- Inject into active cursor bounds.

**Out of scope:**

- Updating DB directly (always go through editor).

## Implementation Steps

1. Implement editor injector logic.
2. Test undo states.

## Files

**Create:**

- `src/modules/editor/services/prose-partial-injector.ts`

**Update:**

- _(none)_

## Acceptance Criteria

- [ ] Highlight ranges inject correctly.
- [ ] Cursor moves cleanly.

## Edge Cases

- No active cursor bounds: append text to end of editor.

## Notes

> Part-level context for Prose Partial Injector Service.
