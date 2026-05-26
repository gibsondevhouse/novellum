# Story Bible / World Building Module

> Last updated: 2026-04-20
> Source: `src/modules/bible/`, `src/modules/world-building/`, `src/routes/projects/[id]/world-building/`

## Purpose

Central structured memory for the novel. Surfaces all world-building data (people, places, objects, plot arcs, events) behind a single consistent shell.

## Sub-sections (canonical names)

The world-building surface is split into five navigable sub-sections. Every section uses the shared `IndividualsWorkspaceShell` component (sidebar + dossier layout).

- **Personae** — individuals, factions, lineages.
- **Atlas** — realms, landmarks, maps, notes.
- **Archive** — myths, technology, traditions, notes.
- **Threads** — major arcs, sub-plots, motivations, notes.
- **Chronicles** — eras, key events, personal histories, notes.

Legacy names (`Characters`, `Locations`, `Lore`, `Plot Threads`, `Timeline`) are deprecated in UI and docs.

## Data Backing

- `characters`, `character_relationships` — Personae.
- `locations` — Atlas.
- `lore_entries` — Archive.
- `plot_threads` — Threads.
- `timeline_events` — Chronicles.

See [`../data-model.md`](../data-model.md) for full entity shapes.

## Requirements

- Fast lookup via module services hitting `/api/db/*`.
- Editable entries via dossier panels.
- AI-readable serialization (used by `ContinuityAgent`).

## Implementation

- Module roots: `src/modules/bible/` (engine + services) and `src/modules/world-building/` (route composition).
- Shell component: `IndividualsWorkspaceShell` (bible).
- Route: `src/routes/projects/[id]/world-building/<section>/+page.svelte`.

## Future

- Relationship graphs.
- Chronicle visualization.
