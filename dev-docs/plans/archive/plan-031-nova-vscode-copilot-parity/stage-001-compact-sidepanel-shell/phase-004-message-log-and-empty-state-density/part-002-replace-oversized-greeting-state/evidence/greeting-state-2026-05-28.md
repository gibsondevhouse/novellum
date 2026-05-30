# Greeting State Replacement — 2026-05-28

## Greeting Card — Before and After

| Property | Before (plan-023) | After Phase 002 | After Phase 004 |
|---|---|---|---|
| padding | `var(--space-5)` = 20px | `var(--space-3)` = 12px | unchanged |
| margin-top | `var(--space-3)` = 12px | `0` | unchanged |
| title font-size | `var(--text-2xl)` = 24px | `var(--text-lg)` = 18px | unchanged |
| box-shadow | `var(--shadow-nova-greeting)` | `var(--shadow-nova-greeting)` | removed |
| background | candle gradient | candle gradient | flat subtle `color-mix(96%)` |
| border | candle-tinted | candle-tinted | `var(--color-border-subtle)` |
| border-radius | `var(--radius-lg)` | `var(--radius-lg)` | `var(--radius-md)` |
| quick-prompt padding | `var(--space-2) var(--space-4)` | unchanged | `var(--space-1) var(--space-3)` |
| greeting-body max-width | `28ch` | `28ch` | removed (full width) |

## Acceptance Criteria Check

- [x] Empty Nova sidepanel no longer looks like a large marketing card — heavy shadow/gradient removed
- [x] Starter copy reflects the active project context state — greeting body copy changes based on `hasProjectContext`
- [x] Composer visible without excessive scrolling — composer in footer, independent of body height

## Content Honesty Check

Starter prompts and greeting copy do not promise:
- Attachment functionality (Stage 003)
- Agent tool-loop capability (Stage 004)  
- Mode-specific behavior beyond current Chat/Scribe

## Quality Gate Output

```
pnpm check:tokens   → 325 files / 0 violations
pnpm check          → 1687 files / 0 errors
pnpm lint           → clean
pnpm test           → 190 files / 1299 tests passed
```
