---
title: Content Module Shells
slug: phase-002-content-module-shells
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-003-module-shell-implementation
parts:
  - part-001-story-bible-shell
  - part-002-outliner-shell
  - part-003-draft-editor-shell
estimated_duration: 3d
---

## Goal

Create shell pages for the three writing-focused modules: Story Bible, Outliner, and Draft Editor. Each shell must live at its correct route, render a heading and empty-state placeholder, and be ready to have real features layered on in later stages.

## Parts

| #   | Part                                                      | Status  | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [Story Bible Shell](part-001-story-bible-shell/part.md)   | `draft` | Frontend Agent | 1d            |
| 002 | [Outliner Shell](part-002-outliner-shell/part.md)         | `draft` | Frontend Agent | 1d            |
| 003 | [Draft Editor Shell](part-003-draft-editor-shell/part.md) | `draft` | Frontend Agent | 1d            |

## Acceptance Criteria

- [ ] `src/routes/projects/[id]/bible/+page.svelte` renders Story Bible heading and tab bar
- [ ] `src/routes/projects/[id]/outline/+page.svelte` renders Outliner heading and empty beat list
- [ ] `src/routes/projects/[id]/editor/+page.svelte` renders Draft Editor heading and empty document area
- [ ] Each page loads its relevant data table from Dexie (even empty arrays are acceptable)
- [ ] All three pages respond to the route without errors
- [ ] `pnpm run check` and `pnpm run lint` pass
