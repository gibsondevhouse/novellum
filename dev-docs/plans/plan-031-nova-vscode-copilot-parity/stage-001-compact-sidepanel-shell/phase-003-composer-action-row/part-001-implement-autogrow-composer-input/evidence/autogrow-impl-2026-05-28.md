# Auto-Grow Composer Input — 2026-05-28

## Changes Applied

### NovaComposer.svelte — Textarea

| Property | Before | After |
|---|---|---|
| `rows` attribute | `3` | `1` |
| `min-height` | `84px` | removed (auto-grow owns height) |
| `max-height` | `220px` | `144px` (CSS fallback) |
| Auto-grow | none | `$effect` sets `style.height` on `draft` change |

### Auto-Grow Implementation

```svelte
let textareaEl = $state<HTMLTextAreaElement | null>(null);
const MAX_COMPOSER_HEIGHT = 144;

$effect(() => {
    const el = textareaEl;
    if (!el) return;
    const _draft = draft; // dependency
    void _draft;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT)}px`;
});
```

The effect uses `draft` as a reactive dependency so it re-runs on every keystroke. After clearing `style.height` to `auto`, `scrollHeight` returns the natural content height. The result is clamped to `MAX_COMPOSER_HEIGHT` (144px ≈ 4 lines), after which the textarea scrolls internally.

## Keyboard Behavior (unchanged)

- `Enter`: submits draft (calls `submitDraft`)
- `Shift+Enter`: inserts newline, triggers auto-grow
- No new bindings introduced.

## Quality Gate Output

```
pnpm check          → 1687 files / 0 errors
pnpm lint           → clean
pnpm lint:css       → clean
pnpm check:tokens   → 325 files / 0 violations
pnpm test           → 190 files / 1299 tests passed
```
