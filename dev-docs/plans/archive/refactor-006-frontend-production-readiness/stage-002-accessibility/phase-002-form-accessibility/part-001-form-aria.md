---
title: Form ARIA & Label Associations
slug: part-001-form-aria
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-002-form-accessibility
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Audit every form input across the codebase, add missing `<label>` associations, and attach `aria-required` / `aria-invalid` attributes so assistive technology accurately communicates form state to users.

## Scope

**In scope:**

- `src/routes/settings/migrate/+page.svelte` — confirmation checkbox missing `<label>`
- `src/modules/bible/components/RelationshipEditor.svelte` — `<select>` missing `aria-required`
- `src/modules/project/components/ProjectCoreFields.svelte` — genre field missing `aria-invalid`
- All other `<input>`, `<select>`, and `<textarea>` elements in `src/modules/` form components

**Out of scope:**

- Read-only display fields that use `<input disabled>` for styling only
- TipTap editor contenteditable area (handled separately by the editor module)

## Implementation Steps

1. **Migration checkbox:** In `src/routes/settings/migrate/+page.svelte`, add `id="confirm-migration"` to the `<input type="checkbox">` and wrap it with a `<label for="confirm-migration">I confirm...</label>`. The label text should match the existing adjacent copy.

2. **Systematic form audit:** Run `grep -rn "<input\|<select\|<textarea" src/modules/` to enumerate all form controls. For each:
   - If no `<label>` or `aria-label` exists → add `<label for="[id]">` with descriptive text.
   - If the field is required for form submission → add `aria-required="true"`.
   - If the component has error state tracking → bind `aria-invalid={!!errorMessage}` and add `aria-describedby="[field-id]-error"` pointing to an error message element.

3. **Genre field in `ProjectCoreFields.svelte`:** The genre `<select>` must have `aria-invalid={!!genreError}` where `genreError` is derived from validation state. Add an associated `<span id="genre-error" role="alert">` that renders the error message when present.

4. **RelationshipEditor `<select>`:** Add `aria-required="true"` to the relationship type selector.

5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/routes/settings/migrate/+page.svelte`
- `src/modules/bible/components/RelationshipEditor.svelte`
- `src/modules/project/components/ProjectCoreFields.svelte`
- Any additional form components identified by grep in step 2

## Acceptance Criteria

- [ ] Migration confirmation checkbox has an associated `<label>`.
- [ ] All required form fields have `aria-required="true"`.
- [ ] All fields with error state have `aria-invalid={!!error}` and a `role="alert"` error message.
- [ ] `grep -rn "<input" src/` returns no unlabelled `<input>` elements (excluding hidden and disabled types).
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- Some `<input>` elements may already have `aria-label` (e.g., search fields) — that is sufficient; no `<label>` element is needed.
- If a component accepts a user-provided `id` prop, ensure the `<label for>` is also dynamic.
- `role="alert"` error regions should be present in the DOM at all times (hidden when empty), not conditionally rendered — otherwise screen readers won't announce the error when it appears.

## Notes

Do not add visible labels where a design decision was made to show label text as placeholder only. In that case, use `aria-label` on the input instead.
