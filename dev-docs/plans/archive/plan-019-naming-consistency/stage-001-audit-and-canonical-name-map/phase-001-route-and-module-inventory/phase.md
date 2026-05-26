---
title: Route & Module Inventory
slug: phase-001-route-and-module-inventory
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-audit-and-canonical-name-map
parts:
  - part-001-enumerate-current-tree
estimated_duration: 0.5d
---

## Goal

Produce a raw inventory of every route folder, module folder,
and notable component file currently in the tree, with
cross-references showing which routes import which modules.
This is the input data for the canonical-name decision phase.

## Parts

| #   | Part                                                                                  | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Enumerate current tree](part-001-enumerate-current-tree/part.md)                     | `draft` | Planner     | 0.5d          |

## Acceptance Criteria

- [ ] All parts reach `complete` status.
- [ ] `evidence/inventory.md` lists every route, module, and
      component file together with the screen it renders (one
      sentence each).
- [ ] Every duplication or near-duplication
      (e.g. `bible/` ↔ `world-building/`) is flagged in the
      inventory's "Conflicts" section.

## Notes

- This phase is read-only. No file in `src/` is touched.
