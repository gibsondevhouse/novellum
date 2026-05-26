---
title: Route Screenshots and Inventory
slug: part-001-route-screenshots
part_number: 1
status: in-progress
owner: Planner / Reviewer
assigned_to: Planner / Reviewer
phase: phase-001-audit-capture
estimated_duration: 1d
---

# Part-001: Route Screenshots and Inventory

## Objective

Create the baseline route and surface inventory required to execute the cinematic UI refactor without missing visible states.

## Scope

In scope:

- App-level routes, project-level routes, world-building routes, redirects, placeholders, modals, drawers, empty states, loading states, and error states.
- Desktop and mobile screenshots.
- Seed fixture requirements for project-level visual tests.

Out of scope:

- Production UI changes.
- Updating visual baselines.

## Implementation Steps

1. Start the app with representative local data.
2. Inventory every route listed in `ui-consistency.md`.
3. Capture desktop and mobile screenshots for app-level routes.
4. Create or document a seeded project fixture with cover/no-cover, characters, scenes, lore, timeline, plot threads, continuity issues, and image assets.
5. Capture seeded project screenshots for hub, outline, editor, world-building, continuity, images modal/drawer, and key empty/loading states.
6. Document all shared visible components that need production polish.

## Files

Create:

- `dev-docs/plans/plan-015-cinematic-media/audit/route-inventory.md`
- `dev-docs/plans/plan-015-cinematic-media/audit/seed-fixture.md`
- `dev-docs/plans/plan-015-cinematic-media/evidence/baseline-screenshots/`

Update:

- `dev-docs/plans/plan-015-cinematic-media/stage-001-baseline-audit/phase-001-audit-capture/phase-001-audit-capture.md`

## Acceptance Criteria

- [ ] Every visible surface has an inventory row with route/path, state, owner, and screenshot status.
- [ ] Seed fixture requirements are specific enough for another implementer to recreate the test data.
- [ ] Baseline screenshot locations are documented.
- [ ] Empty, loading, and error states are explicitly tracked, not folded into route notes.

## Edge Cases

- Routes with redirects should record both source route and destination behavior.
- Routes requiring project IDs must use repeatable fixture data, not a one-off local ID with no documentation.
