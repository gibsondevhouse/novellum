---
title: Continuity, Redirects, and Future States
slug: part-003-continuity-redirects-future-states
part_number: 3
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-world-overview
estimated_duration: 2d
---

## Part-003: Continuity, Redirects, and Future States

## Objective

Make continuity, consistency redirects, bible redirects, and arc future-state pages production quality.

## Scope

In scope: `/continuity`, consistency route handling, bible redirect pages, arc placeholder pages, prompt/style tabs in continuity.

Out of scope: implementing new arc planner features or new consistency engine rules.

## Implementation Steps

1. Refactor continuity tabs and issue panels into a triage command center.
2. Add severity/status visual language that is not color-only.
3. Polish prompt/style empty states and editor panels.
4. Ensure redirect routes never show rough blank content during navigation.
5. Replace coming-soon pages with `CinematicEmptyState` or route-aware future-state treatment.

## Files

Update likely:

- `src/routes/projects/[id]/continuity/+page.svelte`
- `src/modules/consistency/components/ConsistencyPanel.svelte`
- `src/modules/consistency/components/IssueGroup.svelte`
- `src/modules/consistency/components/IssueRow.svelte`
- `src/modules/continuity/components/PromptEditor.svelte`
- `src/routes/projects/[id]/arcs/+page.svelte`
- `src/routes/projects/[id]/arcs/[arcId]/+page.svelte`
- Redirect route surfaces as needed.

## Acceptance Criteria

- [ ] Continuity issues are grouped, readable, actionable, and keyboard accessible.
- [ ] Empty/no-issue states are polished and actionable.
- [ ] Redirect and future-state pages share the cinematic design language.
- [ ] No future-state route feels like an unfinished stub.

## Edge Cases

- No continuity issues should be a positive state, not an empty table.
