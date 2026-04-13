# Visual Diff Notes — Design Token Overhaul

**Date:** 2026-04-12
**Part:** part-001-design-token-refinement-and-motion-system

---

## Before → After Summary

### Surface Colors

| Surface          | Before                         | After                                                |
| ---------------- | ------------------------------ | ---------------------------------------------------- |
| App background   | `#1a1a1a` (`--color-charcoal`) | `#0a0a0a` (`--color-surface-base`)                   |
| Sidebar rail     | `#0f0f0f` (`--color-slate`)    | `#111111` (`--color-surface-ground`)                 |
| Content panels   | `#1a1a1a`                      | `#191917` (`--color-surface-raised`, warm undertone) |
| Cards / floating | _(same as sidebar)_            | `#222222` (`--color-surface-overlay`)                |
| Hover states     | _(no token)_                   | `#2c2c2c` (`--color-surface-elevated`)               |

### Accent Colors

| Token               | Before    | After     | Notes                     |
| ------------------- | --------- | --------- | ------------------------- |
| `--color-nova-blue` | `#1e40af` | `#3b82f6` | Brighter, more accessible |
| `--color-teal`      | `#0ea5e9` | `#06b6d4` | Distinct AI-cyan flavour  |

### Borders

| Token                   | Before             | After                                 |
| ----------------------- | ------------------ | ------------------------------------- |
| `--color-border`        | `#2a2a2a` (opaque) | `rgba(255,255,255,0.08)` (breathable) |
| `--color-border-subtle` | `#1f1f1f` (opaque) | `rgba(255,255,255,0.04)`              |
| `--color-border-focus`  | _(none)_           | `rgba(59,130,246,0.6)`                |
| `--color-border-strong` | _(none)_           | `rgba(255,255,255,0.16)`              |

### Typography

- `h1` now renders in **DM Serif Display** (400 weight) — editorial feel
- `--font-display` token available for targeted heading overrides
- Inter `font-feature-settings: 'ss01', 'tnum', 'calt'` activated on `html`
- Extended type scale: `--text-4xl/5xl/6xl` available for display copy

### Motion

| Token                       | Before   | After                                 |
| --------------------------- | -------- | ------------------------------------- |
| `--duration-instant`        | _(none)_ | `80ms`                                |
| `--duration-enter`          | _(none)_ | `200ms`                               |
| `--duration-page`           | _(none)_ | `320ms` (used for route transitions)  |
| `--ease-editorial`          | _(none)_ | `cubic-bezier(0.16, 1, 0.3, 1)`       |
| `@keyframes novellum-enter` | _(none)_ | `opacity+translateY(4px)` panel entry |

### Focus Visibility

- **Before:** `outline: none; box-shadow: var(--focus-ring-offset)` — invisible without thick shadow
- **After:** `outline: 2px solid var(--color-border-focus); outline-offset: 2px` — real outline, works in forced-colors mode

### Editor Prose Width

- **Before:** textarea `width: 100%`, no max-width constraint
- **After:** `max-width: 68ch` with `margin: 0 auto` — comfortable reading width, centered

### AiPanel Visual Elevation

- **Before:** flat `--color-slate` (#0f0f0f) background, no shadow
- **After:** `--color-surface-overlay` (#222222) background, `--shadow-lg`, `novellum-enter` animation on open, `--color-ai-tint` indigo wash on suggestion card

---

## Quality Checks

- ✅ `pnpm run check` — 0 errors, 0 warnings
- ✅ `pnpm run lint` — clean
- ✅ `pnpm run test` — 30/30 passed
- ✅ All backward-compat aliases resolve correctly (`--color-charcoal`, `--color-slate`, `--color-border`)
