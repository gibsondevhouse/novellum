---
title: CSS Token Layer
slug: part-001-css-token-layer
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-design-system-foundation
stage: stage-002-application-shell
estimated_duration: 1d
---

## Objective

Create `src/styles/tokens.css` declaring all design system values as CSS custom properties on `:root`. This file is the single source of truth for every visual constant in the application.

## Reference Docs

- Design system: `dev-docs/design-system.md`
- [MDN CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## Token Specification

### Colors

```css
:root {
	/* Backgrounds */
	--color-charcoal: #1a1a1a; /* primary background */
	--color-slate: #0f0f0f; /* deepest background / sidebar */

	/* Accents */
	--color-nova-blue: #1e40af; /* primary action / selected state */
	--color-teal: #0ea5e9; /* secondary accent / AI indicators */

	/* Text */
	--color-text-primary: #e5e5e5;
	--color-text-secondary: #9ca3af;
	--color-text-muted: #6b7280;

	/* Borders */
	--color-border: #2a2a2a;
	--color-border-subtle: #1f1f1f;

	/* States */
	--color-error: #ef4444;
	--color-success: #22c55e;
	--color-warning: #f59e0b;
}
```

### Spacing (4 px base grid)

```css
:root {
	--space-1: 4px;
	--space-2: 8px;
	--space-3: 12px;
	--space-4: 16px;
	--space-5: 20px;
	--space-6: 24px;
	--space-8: 32px;
	--space-10: 40px;
	--space-12: 48px;
	--space-16: 64px;
}
```

### Typography

```css
:root {
	--font-sans: 'Inter', system-ui, sans-serif;
	--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

	--text-xs: 0.75rem; /* 12px */
	--text-sm: 0.875rem; /* 14px */
	--text-base: 1rem; /* 16px */
	--text-lg: 1.125rem; /* 18px */
	--text-xl: 1.25rem; /* 20px */
	--text-2xl: 1.5rem; /* 24px */
	--text-3xl: 1.875rem; /* 30px */

	--font-weight-normal: 400;
	--font-weight-medium: 500;
	--font-weight-semibold: 600;
	--font-weight-bold: 700;

	--leading-tight: 1.25;
	--leading-normal: 1.5;
	--leading-relaxed: 1.75;
}
```

### Layout

```css
:root {
	--sidebar-width: 220px;
	--panel-padding: var(--space-4);
	--radius-sm: 4px;
	--radius-md: 8px;
	--radius-lg: 12px;
}
```

## Implementation Steps

1. Create `src/styles/tokens.css` with all declarations above.
2. Create `src/styles/reset.css` with a minimal CSS reset (box-sizing, margin 0, etc.).
3. Import both files in `src/app.css`: `@import './styles/reset.css'; @import './styles/tokens.css';`
4. Ensure `src/app.css` is imported in `src/routes/+layout.svelte`.

## Acceptance Criteria

- [ ] `src/styles/tokens.css` created with all color, spacing, and typography tokens
- [ ] `src/styles/reset.css` created
- [ ] Both imported via `src/app.css`
- [ ] Browser DevTools confirms `:root` has all custom properties set
- [ ] `pnpm run lint` exits clean
