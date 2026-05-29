# Header and Status Pill Compression — 2026-05-28

## Changes Applied

### NovaPanel.svelte — Header

| Property | Before | After |
|---|---|---|
| Header padding | `var(--space-3) var(--space-4) var(--space-2)` (12/16/8px) | `var(--space-2) var(--space-3)` (8/12px) |
| Session tray padding | `var(--space-2) var(--space-4) var(--space-3)` (8/16/12px) | `var(--space-1) var(--space-3) var(--space-2)` (4/12/8px) |

### NovaPanel.svelte — Greeting Card

| Property | Before | After |
|---|---|---|
| Greeting padding | `var(--space-5)` (20px) | `var(--space-3)` (12px) |
| Greeting margin-top | `var(--space-3)` (12px) | `0` |
| Greeting gap | `var(--space-3)` (12px) | `var(--space-2)` (8px) |
| Greeting title font-size | `var(--text-2xl)` (24px) | `var(--text-lg)` (18px) |
| Constrained greeting padding | `var(--space-4)` (16px) | `var(--space-2)` (8px) |
| 640px greeting padding | `var(--space-4)` (16px) | `var(--space-2)` (8px) |
| 640px greeting title | `var(--text-xl)` (20px) | `var(--text-base)` (16px) |

### ContextDisclosurePill.svelte

| Property | Before | After |
|---|---|---|
| Dot width/height | `6px` (hardcoded) | `var(--size-dot-small)` |

## Accessibility Check

- Close button remains `--space-7` (28px) × `--space-7` — adequate touch target.
- Header title and status text are still separate elements with distinct roles.
- Status text uses `aria-live="polite"` for screen readers — preserved.
- No labels changed.

## Quality Gate Output

```
pnpm check:tokens   → 325 files / 0 violations
pnpm check          → 1687 files / 0 errors
pnpm lint           → clean
pnpm lint:css       → clean
```
