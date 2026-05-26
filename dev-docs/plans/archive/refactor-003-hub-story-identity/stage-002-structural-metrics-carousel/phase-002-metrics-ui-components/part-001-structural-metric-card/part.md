---
title: StructuralMetricCard Component
slug: part-001-structural-metric-card
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-metrics-ui-components
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `StructuralMetricCard.svelte` — a reusable, design-system-native dashboard primitive that displays a story structure metric (arc, act, chapter, scene). The card is substance-forward: it presents a label, a primary count, an optional status line, and an optional link target. It renders "–" gracefully when the metric is not yet ready.

## Context

- Module: `src/modules/project/components/`
- Design system: cards use `--color-surface-overlay` background; equal-height siblings via flexbox stretch; `--color-border-default` hairline border; padding `var(--space-6)`
- This component must be maximally reusable — other modules (Outliner Hub, Story Bible Hub) may import it via `src/modules/project/index.ts`

## Scope

**In scope:**

- `StructuralMetricCard.svelte` — all states: normal, not-ready (–), with status line, with href

**Out of scope:**

- Progress bar / completion percentage indicator (future enhancement — design for it via a reserved prop slot but do not implement)

## Props

```ts
interface StructuralMetricCardProps {
  label: string           // e.g. "Chapters"
  count: number           // numeric count
  ready: boolean          // if false, render "–" instead of count
  statusLine?: string     // e.g. "4 outlined" — rendered below the count
  href?: string           // if provided, entire card is a link
}
```

## Visual Design

- Background: `--color-surface-overlay`
- Border: `1px solid var(--color-border-default)`
- Border-radius: 10px (or a design-system radius token if available)
- Padding: `var(--space-6)` all sides
- Label: `--font-sans`, `--text-xs`, `--tracking-widest`, uppercase, muted opacity (0.5)
- Count: `--font-display`, `--text-5xl`, full opacity; "–" in same style when `!ready`
- Status line: `--font-sans`, `--text-sm`, muted opacity (0.6)
- Hover state (when `href` set): background lifts to `--color-surface-elevated`; transition `var(--duration-base) var(--ease-standard)`
- Full card is a `<a>` when `href`; `<div>` when no `href`

## Implementation Steps

1. Create `src/modules/project/components/StructuralMetricCard.svelte`
1. Use Svelte 5 `$props()` rune; render `<a>` wrapper when `href` is truthy, `<div>` otherwise
1. Export from `src/modules/project/index.ts`

## Files

**Create:**

- `src/modules/project/components/StructuralMetricCard.svelte`

**Update:**

- `src/modules/project/index.ts`

## Acceptance Criteria

- [ ] Card renders label, large count, and optional status line
- [ ] When `ready === false`, count renders as "–" in the same display font
- [ ] Card is an `<a>` when `href` is provided; `<div>` otherwise
- [ ] Hover lift state visible when hovering an `href` card
- [ ] Card is fully keyboard-accessible (focus ring on `<a>`)
- [ ] Exported from `index.ts`
- [ ] ≤100 lines (Svelte template + script)
- [ ] `pnpm run check` exits clean

## Notes

- Keep a `// TODO: add progress indicator slot` comment in the component for future completion % work
- Do not add SVG icons or sparklines in this iteration — count + status line is sufficient
