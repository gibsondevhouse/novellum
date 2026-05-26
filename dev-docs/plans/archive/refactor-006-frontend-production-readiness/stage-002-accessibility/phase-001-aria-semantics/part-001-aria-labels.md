---
title: ARIA Labels & Semantic Roles
slug: part-001-aria-labels
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-aria-semantics
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Replace misapplied ARIA attributes and non-semantic interactive elements with correct semantic HTML so screen readers can accurately convey the application's interactive model.

## Scope

**In scope:**

- `src/lib/components/SidebarItem.svelte` — `<span aria-disabled="true">` must become `<button disabled>` with visible disabled styling
- Any other `<span>` or `<div>` carrying `role="button"` or interaction handlers without proper semantic backing
- All icon-only buttons must have `aria-label` or a visually-hidden `<span>` as a text alternative

**Out of scope:**

- Full ARIA live region implementation (deferred to toast service part)
- Custom combobox or listbox patterns not currently in use

## Implementation Steps

1. Run `grep -rn "aria-disabled" src/` to enumerate all uses. For each, assess whether the element is interactive (`<button>`, `<a>`, `<input>`); if not, refactor to use the correct element.
2. In `src/lib/components/SidebarItem.svelte`: replace the locked `<span aria-disabled="true">` wrapper with a `<button disabled aria-label="...">` — preserve all visual styles via the existing CSS class.
3. Run `grep -rn 'role="button"' src/` — for each result on a non-button element, either replace with `<button>` or justify the ARIA role in a comment.
4. Audit all icon-only buttons (look for `<button>` containing only `<svg>` or an icon component with no visible text). Add `aria-label="[descriptive action]"` to each.
5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/lib/components/SidebarItem.svelte`
- Any additional components identified by grep steps above

## Acceptance Criteria

- [ ] `grep -rn "aria-disabled" src/` returns zero results on `<span>` or `<div>` elements.
- [ ] All icon-only `<button>` elements have `aria-label`.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- A `<span>` may be wrapping a SvelteKit `<a>` tag for link-like behaviour. In that case, apply `aria-disabled` to the `<a>` and use `tabindex="-1"` + `pointer-events: none` via CSS class for the disabled visual state.

## Notes

Do not use `aria-hidden="true"` as a shortcut to hide broken elements. Fix the element, do not hide it.
