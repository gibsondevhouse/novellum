---
title: APG and WCAG Conformance Pass
slug: part-001-apg-wcag-conformance-pass
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Reviewer Agent
phase: phase-001-aria-focus-and-input-modality-compliance
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 4d
---

## Objective

Systematically harden keyboard, focus, and ARIA semantics across interactive components to satisfy WCAG 2.2 AA intent and APG behavior contracts.

## Scope

**In scope:**

- Focus order, focus visibility, and focus-return behavior
- Keyboard interaction contracts for dialogs, tabs, trees, and toolbars
- ARIA role/state labeling consistency for composite widgets
- Pointer target size and modality parity checks
- Route announcement and page-title completeness checks

**Out of scope:**

- Non-UI accessibility concerns outside this product surface
- Localization or content rewrite beyond accessibility metadata requirements

## Implementation Steps

1. Build a component-level accessibility inventory and map each to APG/WCAG criteria.
2. Patch role/state/label mismatches and keyboard gaps in composite widgets.
3. Verify focus management through route changes, dialogs, and enhanced forms.
4. Run structured keyboard and screen-reader walkthroughs.
5. Record findings, resolutions, and residual risks.

## Files

**Create:**

- `dev-docs/plans/refactor-001-ui_ux-polish/stage-003-accessibility-and-keyboard-hardening/phase-001-aria-focus-and-input-modality-compliance/part-001-apg-wcag-conformance-pass/evidence/accessibility-audit-2026-04-12.md`

**Update:**

- `src/lib/components/**`
- `src/routes/**/+page.svelte`
- `src/routes/**/+layout.svelte`
- `src/app.html`
- `dev-docs/design-system.md`

## Acceptance Criteria

- [ ] Composite widgets satisfy APG keybinding and ARIA contract expectations.
- [ ] Focus behavior is predictable across navigation and modal lifecycles.
- [ ] Pointer and keyboard interaction parity is verified for key controls.
- [ ] Accessibility audit artifact with pass/fail evidence is committed.

## Edge Cases

- Ensure escape paths from nested dialogs are deterministic.
- Avoid keyboard traps in rich editors and side panels.
- Avoid ARIA over-application where native semantics are sufficient.

## Notes

No ARIA is better than bad ARIA; use APG patterns as implementation contract for custom widgets.
