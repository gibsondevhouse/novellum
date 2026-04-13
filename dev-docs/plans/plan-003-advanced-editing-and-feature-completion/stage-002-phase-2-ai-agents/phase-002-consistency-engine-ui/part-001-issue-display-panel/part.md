---
title: Issue Display Panel
slug: part-001-issue-display-panel
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-002-consistency-engine-ui
estimated_duration: 1d
---

## Objective

Build the Consistency Engine panel: a sidebar panel that displays the list of `ConsistencyIssue` records for the active project, grouped by type, with severity badges and a count indicator in the sidebar navigation.

## Context

- `src/modules/consistency/services/consistency-repository.ts` (from part-001-continuity-agent)
- `dev-docs/modular-boundaries.md` — consistency module at `src/modules/consistency/`

## Target Files

| File                                                         | Action                                |
| ------------------------------------------------------------ | ------------------------------------- |
| `src/modules/consistency/components/ConsistencyPanel.svelte` | Create — main panel (≤150 lines)      |
| `src/modules/consistency/components/IssueGroup.svelte`       | Create — per-type group with collapse |
| `src/modules/consistency/components/IssueRow.svelte`         | Create — single issue row             |
| `src/modules/consistency/stores/consistency-store.ts`        | Create — reactive issue list          |
| `src/modules/consistency/index.ts`                           | Create — barrel export                |

## Issue Display Fields (per row)

- `type` — icon + label
- `severity` — badge: `warning` (yellow), `error` (red)
- `description` — truncated to 120 chars
- `status` — `open` issues shown by default; toggle to show resolved/dismissed

## Sidebar Badge

- Navigation item for "Consistency" shows a count badge of `open` issues
- Badge hidden when count is 0

## Acceptance Criteria

- [ ] Consistency panel loads all `ConsistencyIssue` records for `activeProjectId` on mount
- [ ] Issues grouped by `type`: timeline, character, lore, plot_thread; each group collapsible
- [ ] Severity badges visually distinct (warning = yellow, error = red)
- [ ] Default view shows only `open` issues; a toggle shows `resolved` and `dismissed`
- [ ] Sidebar nav badge shows count of `open` issues; hides when 0
- [ ] Empty state message shown when no open issues
- [ ] `pnpm run check` exits clean

## Out of Scope

- Resolution actions (→ part-002)
- Issue-to-scene navigation link (→ part-002)
