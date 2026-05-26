---
title: Page Header Pattern
slug: part-002-page-header
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-nav-and-header
started_at: 2026-04-24 04:38 EDT
completed_at: 2026-04-24 06:40 EDT
estimated_duration: 0.75d
---

## Objective

Deliver one canonical top-level page-header pattern and retire every route-local header implementation.

## Scope

**In scope:**

- Canonical page-header primitive: title, breadcrumb / context, actions slot, meta slot.
- Typography and spacing tokens per canonical rules.
- Migration of route-local headers.

**Out of scope:**

- Sidebar (in `part-001-sidebar-and-nav-rail`).

## Implementation Steps

1. Confirm / promote the canonical page-header primitive.
2. Migrate every route-local header from the Stage 001 inventory.
3. Capture before/after screenshots for at least 4 representative routes.

## Files

**Update:**

- Route files listed in the Stage 001 inventory as having header drift.

## Acceptance Criteria

- [x] Canonical `PageHeader` is used by all eligible route families; sanctioned domain heroes are explicitly documented.
- [x] Route-local header CSS is removed for migrated routes; deferred placeholders are tracked with backlog evidence.
- [x] Tokens / lint / typecheck pass.

## Edge Cases

- Editor's top bar remains restrained per Stage 006 intent — Stage 006 may tweak its weight, this part only standardizes the primitive.

## Notes

- Approved exception: `/projects/[id]/hub` uses `ProjectHubHero` as a sanctioned domain hero.
- Deferred route: `/projects/[id]/arcs` remains placeholder until Arc Planner implementation.
