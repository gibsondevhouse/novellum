---
title: Base Typography & Spacing
slug: part-002-base-typography-and-spacing
part_number: 2
status: complete
started_at: 2026-04-12
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-design-system-foundation
stage: stage-002-application-shell
estimated_duration: 1d
---

## Objective

Apply the typography and spacing token values as global element defaults via `src/app.css`. Every piece of text and spacing in the application should derive from these base rules — no per-component font-size or line-height declarations unless overriding for a specific context.

## Reference Docs

- [MDN `font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- Design system: `dev-docs/design-system.md`
- Token values defined in: `part-001-css-token-layer/part.md`

## Implementation Steps

1. In `src/app.css`, after the token imports, add global element styles:

```css
html {
	font-family: var(--font-sans);
	font-size: var(--text-base);
	line-height: var(--leading-normal);
	color: var(--color-text-primary);
	background-color: var(--color-charcoal);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

body {
	margin: 0;
	padding: 0;
}

h1 {
	font-size: var(--text-3xl);
	font-weight: var(--font-weight-bold);
	line-height: var(--leading-tight);
}
h2 {
	font-size: var(--text-2xl);
	font-weight: var(--font-weight-semibold);
	line-height: var(--leading-tight);
}
h3 {
	font-size: var(--text-xl);
	font-weight: var(--font-weight-semibold);
	line-height: var(--leading-tight);
}
h4 {
	font-size: var(--text-lg);
	font-weight: var(--font-weight-medium);
}
p {
	font-size: var(--text-base);
	line-height: var(--leading-relaxed);
}

code,
pre {
	font-family: var(--font-mono);
	font-size: var(--text-sm);
}

a {
	color: var(--color-teal);
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}
```

1. Add Inter and JetBrains Mono as self-hosted or via a `<link>` in `src/app.html`:
   - Use Google Fonts CDN for development: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`
   - Production: evaluate self-hosting for offline/desktop use (Tauri)

## Acceptance Criteria

- [ ] `html` element uses `var(--font-sans)` and `var(--color-charcoal)` background
- [ ] Heading tags `h1`–`h4` use correct token sizes and weights
- [ ] `p`, `code`, `pre` have token-derived styles
- [ ] `a` uses `var(--color-teal)` for link color
- [ ] Font loads on dev server (Inter visible in browser)
- [ ] No hardcoded pixel values in `app.css`
- [ ] `pnpm run lint` exits clean
