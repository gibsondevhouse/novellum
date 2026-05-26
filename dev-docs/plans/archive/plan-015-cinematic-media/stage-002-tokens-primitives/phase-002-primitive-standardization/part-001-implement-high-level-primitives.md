---
title: Implement High-Level Primitives
slug: part-001-implement-high-level-primitives
part_number: 1
status: draft
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-002-primitive-standardization
estimated_duration: 2d
---

# Part-001: Implement High-Level Primitives

## Objective

Create the core components used by route-level cinematic galleries and story identity surfaces.

## Scope

In scope:

- `SpotlightHero`
- `EntityPoster`
- `MediaRail`
- `StatusRing`
- `VisualTile`
- Shared exports and docs/examples

Out of scope:

- Migrating route families to the primitives.
- Domain-specific data fetching or persistence changes.

## Implementation Steps

1. Implement primitives in `src/lib/components/ui/` using Svelte 5 `$props()`.
2. Support snippets or typed action arrays for action regions.
3. Reserve dimensions with aspect ratios and min/max constraints.
4. Implement deterministic visual fallbacks for missing images.
5. Add exports to `src/lib/components/ui/index.ts`.
6. Add focused tests or visual examples where behavior is non-trivial.
7. Document usage in `dev-docs/design-system.md`.

## Files

Create:

- `src/lib/components/ui/SpotlightHero.svelte`
- `src/lib/components/ui/EntityPoster.svelte`
- `src/lib/components/ui/MediaRail.svelte`
- `src/lib/components/ui/StatusRing.svelte`
- `src/lib/components/ui/VisualTile.svelte`

Update:

- `src/lib/components/ui/index.ts`
- `dev-docs/design-system.md`
- Tests or visual showcase route as appropriate.

## Acceptance Criteria

- [ ] Primitives compile and export cleanly.
- [ ] Primitives are token-only and pass `check:tokens`.
- [ ] Primitives support keyboard focus and accessible names.
- [ ] Primitives support reduced-motion fallback.
- [ ] Missing images produce deterministic, polished placeholders.

## Edge Cases

- `EntityPoster` must support at least book/poster, square portrait, 16:9 landscape, and compact tile use cases.
