# Message Log Density — 2026-05-28

## State After Phase 002 (already compact)

| Property | Value | Note |
|---|---|---|
| `.nova-log` gap | `var(--space-2)` = 8px | Reduced in Phase 002 body gap |
| `.nova-bubble` padding | `var(--space-2) var(--space-3)` = 8px/12px | Already compact |
| `.nova-bubble` max-width | `92%` | Preserves readability at 280px |

## Changes in Phase 004

### NovaMessageLog.svelte — Typing Indicator

| Property | Before | After |
|---|---|---|
| Typing dot gap | `5px` (hardcoded) | `var(--space-1)` (4px) |
| Typing dot width/height | `7px` (hardcoded) | `var(--size-dot-small)` (6px) |

## Preservation Checks

- Code blocks (`nova-tool-payload`): `padding: var(--space-2)` — preserved
- Tool chips: `padding: var(--space-2) var(--space-3)` — preserved
- Proposal cards (NovaOutlineCard, NovaSceneDraftCard, etc.): unchanged
- Streaming scroll: not regressed (no JS scroll logic changed)

## Quality Gate Output

```
pnpm check:tokens   → 325 files / 0 violations
pnpm check          → 1687 files / 0 errors
pnpm lint           → clean
pnpm test           → 190 files / 1299 tests passed
```
