---
title: Button Primitive Migration
slug: part-001-button-migration
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-002-component-standardization
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Migrate all ad-hoc `<button class="btn-*">` and bare inline `<button>` elements in module components to the `PrimaryButton`, `GhostButton`, or `DestructiveButton` primitive components.

## Scope

**In scope:**

- `src/modules/export/components/ImportBackupDialog.svelte` — inline `<button>` elements
- `src/modules/bible/components/CharacterForm.svelte` — `.btn-ghost` and `.btn-primary` classes
- `src/routes/settings/migrate/+page.svelte` — `<a>` with `.btn-primary` class
- Any additional `btn-*` class usages found by grep

**Out of scope:**

- Buttons inside the TipTap editor toolbar (managed by the editor module's own button system)
- Navigation `<a>` elements that are styled as links, not action buttons

## Implementation Steps

1. Audit: `grep -rn "class=\"btn-\|class='btn-\|btn-primary\|btn-ghost\|btn-destructive" src/ --include="*.svelte"` to get the full list.

2. For each match, determine the semantic type:
   - Primary/submit action → use `<PrimaryButton>`
   - Secondary/cancel action → use `<GhostButton>`
   - Destructive/delete action → use `<DestructiveButton>` (create if it doesn't exist: a thin wrapper around `GhostButton` or `PrimaryButton` with `--color-error` as the accent)

3. If `DestructiveButton` does not exist, create `src/lib/components/ui/DestructiveButton.svelte` as a wrapper that passes all props through to `PrimaryButton` with a `variant="destructive"` prop or via CSS custom property override.

4. For `<a href="..." class="btn-primary">` in the migration page — if the intent is navigation (not a form action), keep it as an `<a>` but add `role="button"` only if it truly behaves as a button (form-trigger style). Otherwise, use `<GhostButton onclick={() => goto(url)}>` if it's programmatic.

5. Update imports at the top of each modified file.

6. Run `pnpm run lint && pnpm run check`.

## Files

**Create (if needed):**

- `src/lib/components/ui/DestructiveButton.svelte`

**Update:**

- `src/modules/export/components/ImportBackupDialog.svelte`
- `src/modules/bible/components/CharacterForm.svelte`
- `src/routes/settings/migrate/+page.svelte`
- Any additional files from the grep audit

## Acceptance Criteria

- [ ] `grep -rn "class=\"btn-\|class='btn-" src/modules/ src/routes/` returns zero results.
- [ ] All delete/remove actions use `DestructiveButton` or a visually equivalent red-accented button.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- `PrimaryButton` and `GhostButton` may not accept a `type="submit"` prop. Verify the component interface and add `type` to the props if needed before migrating form submit buttons.
- If a component passes through an `onclick` handler as a prop but an existing bare `<button>` used an inline handler, ensure event propagation behaviour is preserved.

## Notes

After this part is complete, the `.btn-primary` and `.btn-ghost` CSS classes in global stylesheets may become dead code — do not remove them yet, as they may still be used by external CSS. Mark them with a `/* potentially unused — review after button migration */` comment.
