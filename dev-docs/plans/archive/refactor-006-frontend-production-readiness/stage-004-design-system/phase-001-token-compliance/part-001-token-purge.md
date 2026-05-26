---
title: Hardcoded Value Purge
slug: part-001-token-purge
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-token-compliance
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Systematically identify and replace every hardcoded dimension (`px`, `rem`) and hardcoded colour (`#hex`, raw `rgb()`/`rgba()`) in `.svelte` component `<style>` blocks with the corresponding design system token.

## Scope

**In scope:**

- All `.svelte` files in `src/` containing hardcoded values in `<style>` blocks
- Known violations from audit:
  - `src/routes/settings/+page.svelte` — `padding: 3rem 2rem`, `font-size: 2rem`, `margin: 0.5rem 0 0 0`, `font-size: 1.125rem`, `border-color: var(--border-color, #333)`
  - `src/modules/settings/components/ApiSettings.svelte` — `padding: 0.5rem 0.75rem`
  - `src/lib/components/rewrite-options-modal/RewriteOptionsModal.svelte` — `padding: 1rem 0`
  - `src/routes/settings/migrate/+page.svelte` — `border: 1px solid var(--color-warning, #e6a817)`

**Out of scope:**

- `src/styles/tokens.css` itself (this IS the ground truth)
- Inline `style` attributes used for dynamic values bound to JS variables (e.g. `style="width: {percent}%"`)
- `1px` border widths that map to no design token (use `var(--color-border-default)` for the colour, keep `1px` for the width)

## Implementation Steps

1. Run the audit grep to get the full list:
   `grep -rn "[0-9]\+rem\|[0-9]\+px\|#[0-9a-fA-F]\{3,6\}" src/ --include="*.svelte"`
   Filter to only `<style>` block content (not template interpolations or class names).

2. Open `src/styles/tokens.css` and build a local mapping table of the values that exist:
   - `--space-1` = `0.25rem`, `--space-2` = `0.5rem`, `--space-3` = `0.75rem`, `--space-4` = `1rem`, `--space-6` = `1.5rem`, `--space-8` = `2rem` etc.
   - `--text-xs` through `--text-3xl`
   - All `--color-*` tokens

3. For each violation from the grep output, replace with the nearest design token. If an exact match doesn't exist, use the closest larger increment (e.g. `1.125rem` → `--text-lg` if that is `1.125rem`, otherwise `--text-base`).

4. For fallback values inside `var(--token, #fallback)` — remove the hardcoded fallback. The token must always resolve; if the design system is loaded, no fallback is needed.

5. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/routes/settings/+page.svelte`
- `src/modules/settings/components/ApiSettings.svelte`
- `src/lib/components/rewrite-options-modal/RewriteOptionsModal.svelte`
- `src/routes/settings/migrate/+page.svelte`
- Any additional files identified in step 1

## Acceptance Criteria

- [ ] Audit grep command from step 1 (scoped to `<style>` blocks) returns zero `rem`/`px`/`#hex` values in the updated files.
- [ ] Visual appearance of all updated pages is unchanged (manual spot check).
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- Some `rem` values may be intentional responsive math (e.g. `clamp(2.2rem, 4vw, 3rem)`) — leave these as-is if no token supports fluid type, and note them with an inline comment: `/* no token for fluid type — intentional */`.
- `1px` as a border width (not a spacing value) is allowed to stay as `1px` — only replace the colour with a token.

## Notes

Do not introduce `!important` to override existing styles. Replace at the source. If a legacy class is fighting the token, rename the local class to be more specific.
