# Plan-015 Token Debt Map (Stage 001)

Date: 2026-04-20

## Source Commands

- `pnpm run check:tokens`
- static token search for `var(--color-brand)`, `var(--font-body)`, `var(--transition-fast)`, `var(--ease-out-back)`, `var(--color-surface)`, `var(--color-border-hover)`

## Summary

- `check:tokens` result: 18 violations across 9 files.
- Violation categories observed: hardcoded rgba/hex values, raw box shadows, undefined token references.

## check:tokens Violations

| File | Line | Rule | Category | Recommended remediation |
| --- | --- | --- | --- | --- |
| `src/routes/projects/[id]/world-building/+page.svelte` | 269, 270 | RULE-T1 | hardcoded rgba | Replace with `var(--color-*)` tokens or documented color-mix token usage. |
| `src/modules/ai/components/ChatInterface.svelte` | 157 | RULE-T1 | hardcoded rgba | Replace with tokenized surface/overlay value. |
| `src/modules/bible/components/CharacterAssetLinker.svelte` | 215 | RULE-T5 | raw shadow | Replace with `var(--shadow-*)`. |
| `src/modules/bible/components/CharacterScratchpad.svelte` | 164, 200 | RULE-T1, RULE-T5 | hardcoded hex + raw shadow | Replace accent and shadow with existing tokens. |
| `src/modules/bible/components/IndividualsDossier.svelte` | 408, 409, 767, 591 | RULE-T1, RULE-T5 | hardcoded rgba + raw shadow | Consolidate to shared panel/card tokens and shadows. |
| `src/modules/bible/components/IndividualsWorkspaceShell.svelte` | 134 | RULE-T5 | raw shadow | Replace with shared shell shadow token. |
| `src/modules/bible/components/RelationshipEditor.svelte` | 186 | RULE-T1 | hardcoded hex | Replace with accent token from tokens.css. |
| `src/modules/bible/components/WorldBuildingTopSectionLanding.svelte` | 89, 90 | RULE-T1 | hardcoded rgba | Replace with surface/overlay tokenized values. |
| `src/modules/project/components/BookCoverCard.svelte` | 180, 184, 185, 186 | RULE-T1 | hardcoded rgba + hex | Replace with tokenized gradients/accents. |

## Undefined Token References

| File | Line | Undefined token | Category | Recommended remediation |
| --- | --- | --- | --- | --- |
| `src/routes/+page.svelte` | 135 | `--color-brand` | undefined token | Replace with documented accent token (`--color-nova-blue` or add alias in tokens.css and design-system.md). |
| `src/routes/styles/+page.svelte` | 341 | `--font-body` | undefined token | Use `--font-sans` or add alias token intentionally. |
| `src/routes/styles/+page.svelte` | 347 | `--transition-fast` | undefined token | Replace with `--duration-*` + `--ease-*` pair. |
| `src/routes/styles/+page.svelte` | 513 | `--ease-out-back` | undefined token | Replace with existing ease token or add documented cinematic easing token. |
| `src/modules/assets/components/ImageGrid.svelte` | 265, 297, 323, 396, 404 | `--color-surface` | undefined token | Replace with `--color-surface-overlay`/`--color-surface-raised` per intended depth. |
| `src/modules/assets/components/ImageGrid.svelte` | 276 | `--color-border-hover` | undefined token | Replace with existing border token or define alias in tokens.css + docs. |

## Stage 002 Remediation Queue

1. Fix undefined token references first (`styles/+page.svelte`, `routes/+page.svelte`, `ImageGrid.svelte`).
2. Remove all raw rgba/hex/shadow values in the nine flagged files.
3. Standardize repeated card/overlay/shadow usage into shared primitives before route-by-route polishing.
4. Re-run `pnpm run check:tokens` after each family and keep zero-violation baseline.
