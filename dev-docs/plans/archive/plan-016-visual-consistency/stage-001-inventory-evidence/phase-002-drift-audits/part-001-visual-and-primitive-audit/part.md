---
title: Visual Language & Primitive Audit
slug: part-001-visual-and-primitive-audit
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-drift-audits
started_at: 2026-04-24
completed_at: 2026-04-25 22:00 EDT
estimated_duration: 1d
---

## Objective

Audit visual language, page archetypes, and component primitive duplication across every surface. Produce two artifacts: a visual-drift findings table and a primitive-duplication inventory.

## Scope

**In scope:**

- Visual language evaluation per surface (cinematic vs SaaS vs dev-console vs CRUD-admin vs author-facing).
- Page archetype classification (gallery, writing, planning, entity-management, review, export, settings).
- Primitive-duplication scan for cards, panels, buttons, section headers, tabs, pills, inputs, textareas, empty states, stat cards, metadata rows, split panes, workspace hero cards, inspector panels, entity cards, list rows.
- Promote/module-local/one-off decision captured per duplicate pattern.

**Out of scope:**

- Density, typography, interaction, empty-state specifics — those are in `part-002-systems-audit`.

## Implementation Steps

1. For every surface in Stage 001's inventory, rate visual fit in plain English (specific, not generic).
2. Classify archetype and record expected visual rules.
3. Grep and read-through every module surface to catalog duplicate primitive implementations.
4. For each duplicate pattern, record: current file(s), tokens used, structural shape, recommendation (promote / module-local / one-off).
5. Save findings to `evidence/visual-and-primitive-audit-YYYY-MM-DD.md`.

## Files

**Create:**

- `.../part-001-visual-and-primitive-audit/evidence/visual-and-primitive-audit-YYYY-MM-DD.md`

**Update:**

- None

## Acceptance Criteria

- [x] Every surface has a plain-English visual-fit assessment.
- [x] Every archetype has defined expected visual rules.
- [x] Every duplicate primitive pattern cites real file paths.
- [x] Each duplicate has a recommendation.

## Edge Cases

- Intentional module-specific visual distinctions must be called out as intentional, not drift.

## Notes

- See research brief §3 (Visual Language), §4 (Component Primitive), and §5 (Page Archetype).
