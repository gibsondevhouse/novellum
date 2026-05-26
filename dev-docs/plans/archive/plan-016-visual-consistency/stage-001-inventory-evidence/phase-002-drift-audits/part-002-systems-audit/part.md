---
title: Density / Typography / Interaction / Empty-State Audit
slug: part-002-systems-audit
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-drift-audits
started_at: 2026-04-24
completed_at: 2026-04-25 22:00 EDT
estimated_duration: 1d
---

## Objective

Audit the four systems-level drift vectors: density/rhythm, typography, interaction patterns, and empty/error/loading states.

## Scope

**In scope:**

- Density map: page padding, card padding, gaps, heading margins, row height, sidebar/inspector widths, grid card width, form field spacing, button height, radius, shadow, scroll containment.
- Typography audit: headings, labels, helper text, body copy, button text, metadata text, prose — drift in size, weight, serif/sans, uppercase usage, letter spacing, muted text, metadata.
- Interaction audit: selected, hover, active, disabled, focus, destructive, create-new, save, edit vs read, inline editing, panel open/close, tab switching, navigation transitions.
- Empty/Error/Loading audit: current copy, current treatment, tone assessment, recommended replacement per state.

**Out of scope:**

- Archetype or primitive duplication (covered in `part-001-visual-and-primitive-audit`).

## Implementation Steps

1. Produce a density map labeling each major screen: too cramped, too spacious, too dashboard-like, too document-like, visually balanced.
2. Produce a typography drift table citing concrete component files.
3. Produce an interaction drift table with at least one finding per interaction category.
4. Produce an empty/error/loading inventory with copy, treatment, tone, and recommendation.
5. Save findings to `evidence/systems-audit-YYYY-MM-DD.md`.

## Files

**Create:**

- `.../part-002-systems-audit/evidence/systems-audit-YYYY-MM-DD.md`

**Update:**

- None

## Acceptance Criteria

- [x] Density map covers every major screen.
- [x] Typography drift findings cite real files.
- [x] Interaction drift findings cover every interaction category.
- [x] Every empty/error/loading state from the inventory appears in the audit with a recommendation.

## Edge Cases

- Narrow / mobile-ish layout drift is flagged but not fixed in this plan.

## Notes

- See research brief §6–§9.
