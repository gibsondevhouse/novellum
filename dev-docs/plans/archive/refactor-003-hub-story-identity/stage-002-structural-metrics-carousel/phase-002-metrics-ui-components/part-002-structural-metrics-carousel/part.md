---
title: StructuralMetricsCarousel Component
slug: part-002-structural-metrics-carousel
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-metrics-ui-components
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Create `StructuralMetricsCarousel.svelte` — a horizontal scroll region composing four `StructuralMetricCard` instances (Arcs, Acts, Chapters, Scenes). Wire it into `+page.svelte` below the hero, loading metric data from `HubMetricsService`. Desktop shows all four cards at equal width in a row; mobile scrolls horizontally without obscuring cards.

## Context

- `HubMetricsService.getProjectMetrics(projectId)` returns `ProjectMetrics` (from part-001-hub-metrics-service)
- `StructuralMetricCard` is already built (part-001-structural-metric-card)
- Future routing targets: `/projects/[id]/arcs`, `/projects/[id]/acts`, `/projects/[id]/chapters`, `/projects/[id]/scenes` (not yet created — `href` props set to these paths anyway)

## Scope

**In scope:**

- `StructuralMetricsCarousel.svelte` — accepts `projectId: string`, loads metrics internally via `HubMetricsService`, renders 4 cards
- Wire carousel into `+page.svelte` below `<ProjectHubHero>`
- Responsive: 4-column equal-width on desktop; horizontal scroll on mobile
- Export from `src/modules/project/index.ts`

**Out of scope:**

- Arc/Act routing destinations (hrefs are forward-compatible but targets don't exist yet)

## Carousel Layout

```css
.metrics-carousel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 767px) {
  .metrics-carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: var(--space-4);
    padding-bottom: var(--space-2);  /* room for scrollbar */
  }
  .metrics-carousel > * {
    flex: 0 0 calc(100% - var(--space-8));
    max-width: 280px;
    scroll-snap-align: start;
  }
}
```

On desktop (≥768px) cards fill equal widths. On mobile, each card occupies most of the viewport and snaps neatly.

## Metric Card Configuration

| Label | count source | ready source | href |
| --- | --- | --- | --- |
| Arcs | `metrics.arcs.count` | `metrics.arcs.ready` | `/projects/{id}/arcs` |
| Acts | `metrics.acts.count` | `metrics.acts.ready` | `/projects/{id}/acts` |
| Chapters | `metrics.chapters.count` | `metrics.chapters.ready` | `/projects/{id}/chapters` |
| Scenes | `metrics.scenes.count` | `metrics.scenes.ready` | `/projects/{id}/scenes` |

## Implementation Steps

1. Create `src/modules/project/components/StructuralMetricsCarousel.svelte`

1. Load metrics in `$effect` or `onMount`:

```ts
let metrics = $state<ProjectMetrics | null>(null)
$effect(() => {
  getProjectMetrics(projectId).then(m => metrics = m)
})
```

1. Render a loading skeleton (4 ghost cards) while `metrics === null`

1. Render 4 `<StructuralMetricCard>` instances from config table above

1. Add `StructuralMetricsCarousel` to `src/modules/project/index.ts`

1. In `+page.svelte`, add `<StructuralMetricsCarousel projectId={project.id} />` directly after `<ProjectHubHero>`

## Files

**Create:**

- `src/modules/project/components/StructuralMetricsCarousel.svelte`

**Update:**

- `src/routes/projects/[id]/+page.svelte` — add `<StructuralMetricsCarousel>`
- `src/modules/project/index.ts`

## Acceptance Criteria

- [ ] Carousel renders below the hero on the Hub page
- [ ] All 4 metric cards visible on desktop without horizontal scroll
- [ ] Arcs and Acts show "–" (ready: false) without errors
- [ ] Chapters and Scenes show real counts from Dexie
- [ ] Mobile horizontal scroll works; cards snap to position
- [ ] Loading skeleton renders while data loads
- [ ] `href` props correctly set on all 4 cards (even if targets 404 for now)
- [ ] `StructuralMetricsCarousel` exported from `index.ts`
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean

## Edge Cases

- `getProjectMetrics` throws — catch and render all cards as `ready: false` with count 0
- Project has 0 chapters and 0 scenes — renders "0", not "–" (ready is true, count is zero)

## Notes

- The loading skeleton must not be jarring; a simple opacity-pulsing ghost card using CSS animation is sufficient
- Do not use a third-party carousel library; the CSS scroll approach is sufficient and lighter
