---
title: Domain Tiles Refactor
slug: phase-001-domain-tiles-refactor
phase_number: 1
status: draft
owner: Stylist Agent
stage: stage-002-ui-integration
parts:
  - part-001-add-action-trio
  - part-002-add-readiness-badges
  - part-003-add-completion-counts
estimated_duration: 2d
---

## Goal

Refactor each worldbuilding domain tile to surface three explicit actions (open, help, generate) and display readiness badges and live completion counts drawn from canonical tables.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Action Trio](part-001-add-action-trio/part.md) | `draft` | — | 0.75d |
| 002 | [Add Readiness Badges](part-002-add-readiness-badges/part.md) | `draft` | — | 0.5d |
| 003 | [Add Completion Counts](part-003-add-completion-counts/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Each domain tile exposes Open, Help, and Generate actions
- [ ] Readiness badges render correctly for all 5 domains (derived from workflow config)
- [ ] Completion counts display live record counts from canonical tables (characters, locations, lore_entries, plot_threads, timeline_events, factions)
- [ ] Tiles remain accessible (keyboard navigable, proper ARIA labels)
- [ ] No hardcoded colors — all visual states use design tokens
- [ ] `pnpm check`, `pnpm lint`, `pnpm lint:css` pass

## Notes

**Depends on stage-001-phase-002** (workflow config) for readiness badges.
**Depends on stage-001-phase-001** (help extraction) for the Help action.

Completion count targets by domain:

| Domain | Tables to count |
| --- | --- |
| Personae | `characters`, `factions`, `character_relationships` |
| Atlas | `locations` |
| Archive | `lore_entries`, `themes`, `glossary_terms` |
| Threads | `plot_threads` |
| Chronicles | `timeline_events` |

Counts can be zero-loaded on first render; no loading skeleton required on this phase.
