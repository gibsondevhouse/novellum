---
title: AI Panel Refit
slug: part-001-ai-panel-refit
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-ai-assistant
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Refit the AI Assistant panel to canonical panel rhythm and tone.

## Scope

**In scope:**

- Panel container, section rhythm, message / suggestion treatment.
- Empty and loading states inside the panel.
- Copy tone review by Stylist.

**Out of scope:**

- AI pipeline logic (PromptBuilder, ContextEngine, model router).

## Implementation Steps

1. Migrate AI panel container to canonical panel primitive.
2. Align message/suggestion visual weight with panel rules.
3. Review copy tone.
4. Screenshot evidence.

## Files

**Update:**

- AI panel components under `src/modules/ai/**` (presentation only).

## Acceptance Criteria

- [ ] Panel matches canonical rhythm.
- [ ] Copy tone in-voice.
- [ ] AI pipeline logic untouched.

## Edge Cases

- Streaming responses must still announce correctly for a11y.

## Notes

- Follow `.github/skills/ai-context/SKILL.md` for any context-related touches.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
