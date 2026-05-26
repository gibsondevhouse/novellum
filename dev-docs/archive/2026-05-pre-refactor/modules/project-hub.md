# Project Hub

## Overview

The Project Hub (`/projects/[id]`) is the story identity and command surface for each project. It presents the book's identity (cover, title, logline, synopsis) as a dominant hero composition, followed by structural metrics, progress tracking, the primary action card, and metadata.

## Section Hierarchy (DOM order)

1. **Story Hero** — `ProjectHubHero` (cover + title + genre + logline + synopsis)
2. **Structural Metrics** — `StructuralMetricsCarousel` (4 metric cards: Arcs, Acts, Chapters, Scenes)
3. **Progress** — Word count progress bar and stats
4. **Next Action** — CTA card linking to the editor
5. **Metadata** — Status, created date, target word count

## Component Architecture

| Component | File | Purpose |
| --- | --- | --- |
| `ProjectHubHero` | `src/modules/project/components/ProjectHubHero.svelte` | Hero shell — two-column grid (cover + content) |
| `ProjectHeroCover` | `src/modules/project/components/ProjectHeroCover.svelte` | Cover image / 2:3 placeholder with edit trigger |
| `ProjectHeroContent` | `src/modules/project/components/ProjectHeroContent.svelte` | Title, genre badge, logline, synopsis, edit button |
| `ProjectHeroSynopsis` | `src/modules/project/components/ProjectHeroSynopsis.svelte` | Full synopsis block; empty state shows ghost CTA |
| `StructuralMetricCard` | `src/modules/project/components/StructuralMetricCard.svelte` | Reusable metric card (exported for other modules) |
| `StructuralMetricsCarousel` | `src/modules/project/components/StructuralMetricsCarousel.svelte` | 4-card horizontal grid with mobile scroll |
| `HubMetricsService` | `src/modules/project/services/hub-metrics-service.ts` | `getProjectMetrics(projectId)` — Dexie count queries |

## Edit Contract

All edit interactions in the hero tree call `onEdit()`, which opens `EditProjectForm` via the `'projectActions'` context injected by `+layout.svelte`. No inline form state lives in the hero component tree.

## Responsive Breakpoints

| Breakpoint | Hero | Metrics | Lower sections |
| --- | --- | --- | --- |
| ≥1024px | Two-column (240px cover) | 4 equal-width cards | Single column, max 680px |
| 768px–1023px | Two-column (180px cover) | 4 cards (compressed) | Single column |
| ≤640px | Single column, cover centred | Horizontal scroll, snap | Single column |
