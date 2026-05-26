---
title: Collection Zone
slug: phase-002-collection-zone
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-002-component-architecture
parts:
  - part-001-collection-pane-and-crud-card
  - part-002-create-structure-card
estimated_duration: 1d
---

## Goal

> Build the scrollable lower management zone: a collection pane that renders dense CRUD cards for the active mode's entities, and a visually-subordinate create card that serves as the insertion point for new items.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Collection Pane & CRUD Card](part-001-collection-pane-and-crud-card/part.md) | `draft` | frontend | 0.5d |
| 002 | [Create Structure Card](part-002-create-structure-card/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] `WorkspaceCollectionPane` renders a scrollable container with hidden scrollbar
- [ ] Collection pane only shows cards for the active hero mode
- [ ] `StructureCrudCard` displays entity summary with select, rename, delete actions
- [ ] Selecting a card updates the hero to show that item's details
- [ ] `CreateStructureCard` is visually smaller and subordinate to real cards
- [ ] When no items exist, only the `CreateStructureCard` appears (no full-size empty card)
- [ ] Clicking the create card creates the first item for the active mode
- [ ] When items exist, the create card appears at the end of the list as an insertion utility
- [ ] Cards match Hub visual language: rounded surfaces, subtle borders, restrained accents

## Notes

> CRUD actions are lightweight inline operations. Rename uses an inline text input (similar to Hub hero inline editing). Delete shows a confirmation before removing. Select just updates the hero selection.
>
> The collection pane uses CSS `overflow-y: auto` with hidden scrollbar via `-webkit-scrollbar` / `scrollbar-width: none`.
>
> Cards should be shorter and slightly narrower than the hero card, creating visual hierarchy between the summary zone and the management zone.
