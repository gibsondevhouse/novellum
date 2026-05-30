# Single Action Row Controls — 2026-05-28

## Action Row Layout

Target achieved: `[+] [</>] [Mode] [Model] ... [Send/Stop]`

| Control | Class | Size | State | Notes |
|---|---|---|---|---|
| `[+]` Attach | `.nova-action-slot` | 28×28px | disabled | Honest placeholder; Stage 003 wires |
| `[</>]` Commands | `.nova-action-slot` | 28×28px | disabled | Honest placeholder; Stage 004 wires |
| Mode select | `.nova-mode-select` | 72px min-w, 28px h | active | Moved from separate top row |
| Model picker | (in `.nova-model-slot`) | 92px max-w | active | Moved from NovaPanel session tray |
| Spacer | `.nova-composer__spacer` | flex:1 | - | Pushes send right |
| Send button | `.nova-action-send` | 32×32px | active | Reduced from 40×40px; shadow removed |
| Stop button | `.nova-action-stop` | auto | active | Unchanged behavior |

## NovaPanel.svelte Changes

- Removed `import ModelPickerDropdown` (moved to composer)
- Session tray `aria-label`: `"Context and model controls"` → `"Context disclosure"` (model now in composer)
- Session tray now only contains: loading dot + ContextDisclosurePill

## Test Updated

`tests/nova/nova-panel.test.ts` — updated test description and assertion to `'Context disclosure'`.

## Width Budget at 280px

Panel at 280px → shell padding 2×8px → available: ~264px

```
[+] 28 + [</>] 28 + [Mode] 72 + [Model] 92 + spacer + [Send] 32 + gaps (5×4) = 272px min
```

At 280px panel this fits with ~8px spare. Model picker can flex-shrink below 92px if needed. The spacer absorbs any surplus.

## Quality Gate Output

```
pnpm check          → 1687 files / 0 errors
pnpm lint           → clean
pnpm lint:css       → clean
pnpm check:tokens   → 325 files / 0 violations
pnpm test           → 190 files / 1299 tests passed
```
