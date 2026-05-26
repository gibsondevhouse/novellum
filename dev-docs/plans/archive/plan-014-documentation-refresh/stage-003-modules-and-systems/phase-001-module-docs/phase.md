---
title: Module Docs
slug: phase-001-module-docs
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-modules-and-systems
parts:
  - part-001-bible-and-editor
  - part-002-outliner-consistency-export-hub
estimated_duration: 1d
---

## Goal

Refresh all files under `dev-docs/modules/` so they describe the shipped module source.

## Parts

| #   | Part                                                                                      | Status  | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Bible & Editor](part-001-bible-and-editor/part.md)                                       | `draft` | architect   | 0.5d          |
| 002 | [Outliner / Consistency / Export / Hub](part-002-outliner-consistency-export-hub/part.md) | `draft` | architect   | 0.5d          |

## Acceptance Criteria

- [ ] `story-bible.md`, `editor.md`, `editing-layer.md` match `src/modules/bible` and `src/modules/editor`.
- [ ] `outliner.md`, `consistency-engine.md`, `export.md`, `project-hub.md` match their modules.
- [ ] All module docs reference the current `IndividualsWorkspaceShell` world-building surface where relevant.
