---
title: Focus Trap & Keyboard Navigation
slug: part-002-focus-management
part_number: 2
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-aria-semantics
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Ensure all modal dialogs implement a proper focus trap (focus cannot escape while open, Escape closes, focus returns to trigger on close) and that the workspace carousel is fully keyboard-navigable.

## Scope

**In scope:**

- `src/lib/components/OnboardingModal.svelte` — focus trap, Escape key, initial focus, focus return
- `src/modules/workspace/components/StructureCarousel.svelte` — keyboard navigation on nav buttons (currently `tabindex="-1"`)
- Any other modal/dialog component using `role="dialog"` without a matching `aria-modal="true"` and focus trap
- Any other `tabindex="-1"` on a focusable navigation control

**Out of scope:**

- Building a reusable `<FocusTrap>` utility component (scope creep); inline implementation is acceptable here

## Implementation Steps

1. **OnboardingModal focus trap:**
   - On mount, save the previously focused element (`document.activeElement`).
   - Move initial focus to the first actionable element inside the modal (`#onboarding-cta` button).
   - Add a `keydown` listener on the modal container: Tab cycles within focusable children; Shift+Tab cycles backwards; Escape calls `dismiss()`.
   - In `dismiss()`, restore focus to the previously saved element.
   - Add `aria-modal="true"` to the container element alongside its existing `role="dialog"`.
   - Fix the backdrop `onclick` check: only dismiss if `event.target === event.currentTarget` (prevents dismissal when clicking inside the modal content).

2. **StructureCarousel keyboard access:**
   - Remove `tabindex="-1"` from the Prev/Next navigation buttons in `src/modules/workspace/components/StructureCarousel.svelte`.
   - Add `aria-label="Previous"` and `aria-label="Next"` (or use the existing visible label if present).
   - Verify the buttons respond to Enter/Space key presses (standard `<button>` behaviour — confirm they are `<button>` elements, not `<div>`s).

3. **Audit remaining dialogs:** Run `grep -rn 'role="dialog"' src/` — for each match, confirm `aria-modal="true"` is present and a focus trap is implemented.

4. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/lib/components/OnboardingModal.svelte`
- `src/modules/workspace/components/StructureCarousel.svelte`
- Any additional dialog components identified in step 3

## Acceptance Criteria

- [ ] Tab key cannot exit `OnboardingModal` while it is open.
- [ ] Pressing Escape closes `OnboardingModal` and returns focus to the trigger.
- [ ] `StructureCarousel` prev/next buttons are reachable by Tab and activate on Enter/Space.
- [ ] All `role="dialog"` elements have `aria-modal="true"`.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- If the modal content is rendered with `{#if open}` and destroyed on close, the previously focused element reference may be stale. Store it in a variable scoped outside the `{#if}` block.
- If no focusable children exist inside the modal (edge case), fall back to focusing the modal container itself with `tabindex="-1"`.

## Notes

Avoid third-party focus trap libraries to keep the bundle lean. The implementation here is straightforward enough to do inline.
