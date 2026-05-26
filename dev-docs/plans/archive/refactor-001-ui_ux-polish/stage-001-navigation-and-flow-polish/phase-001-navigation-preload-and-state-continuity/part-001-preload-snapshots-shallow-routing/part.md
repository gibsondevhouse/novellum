---
title: Preload, Snapshots, and Shallow Routing
slug: part-001-preload-snapshots-shallow-routing
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-navigation-preload-and-state-continuity
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 4d
---

## Objective

Tune route-loading and history behavior so users experience immediate, context-preserving transitions in high-frequency writing workflows.

## Scope

**In scope:**

- Route preload strategy (`data-sveltekit-preload-data` and `data-sveltekit-preload-code`)
- Programmatic preloading where predictive UX requires it
- Snapshot-based recovery for in-progress text input and panel state
- Shallow-routing history entries for modal and drill-in overlays
- Focus and scroll correctness after navigation and enhanced forms

**Out of scope:**

- New navigation IA or route taxonomy changes
- Any backend API changes unrelated to UX continuity

## Implementation Steps

1. Audit current route transition behavior and identify lag/disorientation points.
2. Define per-surface preload policy (hover/tap/viewport/eager) and apply it intentionally.
3. Add snapshots for interruption-prone states and implement restore verification.
4. Implement at least one history-driven modal/drawer using shallow routing.
5. Validate focus, scroll, and back-button behavior across desktop and mobile scenarios.

## Files

**Create:**

- `tests/ui/navigation-continuity.test.ts`

**Update:**

- `src/app.html`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/routes/projects/**`
- `src/lib/components/**`

## Acceptance Criteria

- [ ] Preload strategy is explicitly documented and implemented for primary navigation links.
- [ ] At least one critical flow restores unsaved state correctly via snapshots.
- [ ] At least one modal/overlay flow uses shallow routing with reliable back navigation behavior.
- [ ] Focus and scroll behavior pass manual QA checklist after each tuned flow.

## Edge Cases

- Save-Data users must not receive aggressive preload behavior.
- Snapshot payloads should stay small to avoid session storage pressure.
- Shallow-routing behavior must degrade gracefully if JavaScript is unavailable.

## Notes

Prefer native SvelteKit APIs (`preloadData`, `pushState`, `replaceState`, snapshots) over custom routing layers.
