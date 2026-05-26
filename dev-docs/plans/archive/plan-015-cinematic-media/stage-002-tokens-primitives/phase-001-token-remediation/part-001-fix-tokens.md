---
title: Fix Undefined Tokens and Hardcoded Values
slug: part-001-fix-tokens
part_number: 1
status: draft
owner: Stylist
assigned_to: Stylist
phase: phase-001-token-remediation
estimated_duration: 2d
---

# Part-001: Fix Undefined Tokens and Hardcoded Values

## Objective

Clear all current token-blocking issues so later UI work starts from a production-grade design-system baseline.

## Scope

In scope:

- Undefined token references.
- `check:tokens` violations in Svelte components.
- Documentation for any new tokens.
- Shared CSS utility extraction for repeated gradients/overlays.

Out of scope:

- Route redesigns and primitive implementation.

## Implementation Steps

1. Use `audit/token-debt-map.md` as the source work queue.
2. Replace undefined tokens with existing tokens whenever possible.
3. Replace raw `rgba()`, hex colors, raw box-shadow values, raw transition durations, and raw easing values.
4. Add new tokens only for repeated semantic patterns and document them immediately.
5. Rerun `pnpm run check:tokens`.
6. Run `pnpm run lint` and `pnpm run check` for safety.

## Files

Update likely:

- `src/routes/+page.svelte`
- `src/routes/styles/+page.svelte`
- `src/modules/assets/components/ImageGrid.svelte`
- Files listed in `audit/token-debt-map.md`
- `src/styles/tokens.css`
- `dev-docs/design-system.md`

## Acceptance Criteria

- [ ] `pnpm run check:tokens` passes with zero violations.
- [ ] Static search finds no unresolved undefined token references.
- [ ] New tokens, if any, are documented in `dev-docs/design-system.md`.
- [ ] No unrelated route redesigns are bundled into this remediation part.

## Edge Cases

- Dynamic inline style values must reference CSS custom properties instead of embedding raw values.
