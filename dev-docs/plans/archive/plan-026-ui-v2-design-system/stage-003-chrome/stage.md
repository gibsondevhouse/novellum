---
title: Chrome Refactor
slug: stage-003-chrome
stage_number: 3
status: complete
owner: Architect Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-003-header
estimated_duration: 1.5d
risk_level: medium
---

## Goal

Refactor the global chrome (`AppShell`, `AppSidebar`, `AppHeader`,
`SecondaryLeftSidebar`, `Breadcrumb`) to v2 anatomy: dual-band 208/56 sidebar,
52px serif header with eyebrow + breath bar, and Lucide-family icons extracted
to `src/lib/assets/icons/`.

## Phases

| #   | Phase                                              | Status  | Est. Duration |
| --- | -------------------------------------------------- | ------- | ------------- |
| 001 | [AppShell](phase-001-app-shell/phase.md)           | `draft` | 0.25d         |
| 002 | [Sidebar](phase-002-sidebar/phase.md)              | `draft` | 0.5d          |
| 003 | [Header & Breadcrumb](phase-003-header/phase.md)   | `draft` | 0.75d         |

## Entry Criteria

- Stages 001 and 002 complete.

## Exit Criteria

- Sidebar widths consume `--sidebar-width` / `--sidebar-collapsed-width`
  (208 / 56).
- Header height consumes `--header-height` (52px) with eyebrow + serif title +
  optional breath bar (session info center, action cluster right).
- Two-band nav model (Global: Library / Nova / Settings; Project: Editor /
  Outline / World / Reader / Continuity / Export) — labels follow v2 vocab,
  paths unchanged.
- Inline SVGs replaced with Lucide-family icons imported from
  `src/lib/assets/icons/`.
- Keyboard navigation preserved; focus rings visible.
- Quality gates green; Tauri titlebar still aligns.

## Notes

- "Muse" label replaces "Nova" star where applicable; handler still toggles
  the existing Nova panel until Stage 004 swaps the panel surface.
- Breadcrumb stays on second row only in editor / scene routes.
