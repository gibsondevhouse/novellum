# Design System

## Philosophy

Dark, focused, editorial workspace. The visual language communicates craft and intention — it should feel like a serious writing instrument, not a generic productivity tool.

## Surface Layers

Surfaces follow a luminance hierarchy. Higher layers are always lighter than their parent.

| Token                      | Value                    | Usage                                   |
| -------------------------- | ------------------------ | --------------------------------------- |
| `--color-surface-base`     | `#0a0a0a`                | App root / `<html>` background          |
| `--color-surface-ground`   | `#111111`                | Sidebar, navigation rail                |
| `--color-surface-raised`   | `#191917`                | Primary content panels (warm undertone) |
| `--color-surface-overlay`  | `#222222`                | Cards, floating panels                  |
| `--color-surface-elevated` | `#2c2c2c`                | Hover states, highlighted rows          |
| `--color-surface-glass`    | `rgba(255,255,255,0.04)` | Frosted-glass overlays                  |

Legacy aliases still resolve: `--color-charcoal` → `--color-surface-raised`, `--color-slate` → `--color-surface-ground`.

## Colors

### Accents

| Token               | Value                    | Usage                              |
| ------------------- | ------------------------ | ---------------------------------- |
| `--color-nova-blue` | `#3b82f6`                | Primary action, interactive states |
| `--color-teal`      | `#06b6d4`                | AI indicators, secondary accent    |
| `--color-ai-tint`   | `rgba(99,102,241,0.08)`  | AI-context panel surface wash      |
| `--color-selection` | `rgba(245,240,235,0.08)` | Editorial selection / active row   |

### Borders (rgba — breathable hairlines)

| Token                    | Value                    | Usage                 |
| ------------------------ | ------------------------ | --------------------- |
| `--color-border-default` | `rgba(255,255,255,0.08)` | Standard dividers     |
| `--color-border-subtle`  | `rgba(255,255,255,0.04)` | Intra-panel hairlines |
| `--color-border-strong`  | `rgba(255,255,255,0.16)` | Emphasis borders      |
| `--color-border-focus`   | `rgba(59,130,246,0.6)`   | Keyboard focus rings  |

Legacy alias: `--color-border` → `--color-border-default`.

## Typography

### Font Families

| Token            | Stack                                      | Usage                                    |
| ---------------- | ------------------------------------------ | ---------------------------------------- |
| `--font-sans`    | `'Inter', system-ui, sans-serif`           | All UI text                              |
| `--font-display` | `'DM Serif Display', Georgia, serif`       | `h1`, project titles, editorial headings |
| `--font-mono`    | `'JetBrains Mono', 'Fira Code', monospace` | Code, editor textarea                    |

DM Serif Display is loaded via Google Fonts. Inter uses `font-feature-settings: 'ss01', 'tnum', 'calt'`.

### Type Scale

UI: `--text-xs` (12px) through `--text-3xl` (30px). Editorial/display: `--text-4xl` (36px), `--text-5xl` (48px), `--text-6xl` (60px).

### Letter-Spacing

`--tracking-tight` (-0.03em) · `--tracking-normal` (0) · `--tracking-wide` (0.04em) · `--tracking-widest` (0.12em)

## Prose

| Token               | Value            | Usage                                           |
| ------------------- | ---------------- | ----------------------------------------------- |
| `--prose-width-max` | `68ch`           | Optimal measure for body copy / editor textarea |
| `--prose-inset`     | `var(--space-6)` | Horizontal prose padding                        |
| `--prose-gap-line`  | `1.75rem`        | Paragraph-to-paragraph gap                      |
| `--prose-gap-block` | `2.5rem`         | Section break before headings                   |

## Layout

- Sidebar: `--sidebar-width: 220px`
- Main: `--panel-padding: var(--space-4)`

## UI Rules

- Minimal distractions, clear hierarchy, fast interactions
- All borders use rgba tokens — never opaque hex dividers
- Surface elevation always increases with z-layer (base → ground → raised → overlay → elevated)

## Motion

### Durations

`--duration-instant` (80ms) · `--duration-fast` (100ms) · `--duration-base` (150ms) · `--duration-enter` (200ms) · `--duration-slow` (250ms) · `--duration-page` (320ms)

### Easing

| Token               | Curve                        | Usage                            |
| ------------------- | ---------------------------- | -------------------------------- |
| `--ease-standard`   | `cubic-bezier(0.4,0,0.2,1)`  | Default state transitions        |
| `--ease-decelerate` | `cubic-bezier(0,0,0.2,1)`    | Elements entering screen         |
| `--ease-editorial`  | `cubic-bezier(0.16,1,0.3,1)` | Panel entry — spring-like settle |
| `--ease-exit`       | `cubic-bezier(0.4,0,1,1)`    | Elements leaving screen          |

### Keyframes

- `novellum-enter` — opacity 0→1 + translateY(4px→0). Used for AI panel, floating panels entering the DOM.
- `fade-in` / `fade-out` — used for SvelteKit View Transitions.

All animations respect `@media (prefers-reduced-motion: reduce)`.

## Components

- Cards — `--color-surface-overlay` background, `--shadow-xs`, `--color-border-default` border
- AI Assistant panel — `--color-surface-overlay` background, `--shadow-lg`, `--color-ai-tint` suggestion card
- Editor panels — `--color-surface-raised` background
- Sidebar — `--color-surface-ground` background
