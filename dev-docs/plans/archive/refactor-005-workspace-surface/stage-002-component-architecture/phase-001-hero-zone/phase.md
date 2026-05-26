---
title: Hero Zone
slug: phase-001-hero-zone
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-component-architecture
parts:
  - part-001-hero-shell-and-mode-switcher
  - part-002-hero-card
estimated_duration: 1d
---

## Goal

> Build the fixed upper hero zone: a shell container that pins to the top of the workspace, a mode switcher with left/right arrow controls for cycling between structural layers, and a mode-adaptive hero card that displays the currently selected item's details or a polished empty state.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hero Shell & Mode Switcher](part-001-hero-shell-and-mode-switcher/part.md) | `draft` | frontend | 0.5d |
| 002 | [Hero Card](part-002-hero-card/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] `WorkspaceHeroShell` renders as a fixed container at the top of the workspace
- [ ] `StructureModeSwitcher` displays the current mode label with left/right arrow buttons
- [ ] Left/right arrows cycle through Arcs → Acts → Chapters → Scenes (wrapping)
- [ ] `WorkspaceHeroCard` renders mode-specific content for the selected item
- [ ] Arc hero: title, description, purpose
- [ ] Act hero: title, intent (planningNotes), structural purpose
- [ ] Chapter hero: title, summary, scene count
- [ ] Scene hero: title, POV, purpose, conflict
- [ ] Empty state renders when no items exist for the active mode, with a creation CTA
- [ ] Hero card height is stable across all modes and states (no layout jumping)
- [ ] Visual treatment matches Hub hero card language

## Notes

> The mode switcher arrows switch between structural modes (Arcs/Acts/Chapters/Scenes), NOT between individual records within a mode. Record navigation happens via selection in the lower collection pane.
>
> Scene hero "POV" displays the character name, which requires a lookup from the `characters` table via `povCharacterId`. If no character is assigned, show "No POV assigned".
>
> Chapter "scene count" is derived from the loaded scenes data filtered by chapterId.
