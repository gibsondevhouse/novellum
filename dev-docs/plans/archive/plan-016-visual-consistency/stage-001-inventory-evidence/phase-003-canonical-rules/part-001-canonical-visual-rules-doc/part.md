---
title: Canonical Visual Rules Document
slug: part-001-canonical-visual-rules-doc
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-canonical-rules
started_at: 2026-04-24
completed_at: 2026-04-25 22:00 EDT
estimated_duration: 1d
---

## Objective

Distill audit findings into a single canonical visual rules document that every later stage and part references.

## Scope

**In scope:**

- Rules for: page shell, page header, cards, panels, inspector panels, forms, buttons, tabs/pills, empty states, workspace hero cards, editor surface, AI assistant surface, metadata rows, entity cards, scroll behavior.
- Preservation rules for intentional archetype distinctions (writing vs planning vs entity-management vs review vs export vs settings).
- Explicit tone anchors for empty / loading / error copy.

**Out of scope:**

- New design tokens (only allowed if absolutely required, recorded as a follow-up risk).

## Implementation Steps

1. Decide the destination: append to `dev-docs/design-system.md` or create `dev-docs/canonical-visual-rules.md`. Capture the decision in `impl.log.md`.
2. Draft rules per category, each with: target primitive(s), spacing / width / typography tokens, interaction expectations, archetype applicability.
3. Review with Architect (layout/structural rules) and Stylist (visual/tone rules).
4. Merge accepted rules; record the version in `impl.log.md`.

## Files

**Create:**

- Possibly `dev-docs/canonical-visual-rules.md` (if decision is separate doc).

**Update:**

- `dev-docs/design-system.md` (if decision is append).

## Acceptance Criteria

- [x] Rules cover every category in the scope.
- [x] Archetype preservation rules present.
- [x] Tone anchors present.
- [x] Architect and Stylist sign-off recorded in `impl.log.md`.

## Edge Cases

- If a rule conflicts with an existing token, note the conflict and defer resolution to a follow-up rather than silently changing tokens.

## Notes

- This document is the contract every later part cites.
