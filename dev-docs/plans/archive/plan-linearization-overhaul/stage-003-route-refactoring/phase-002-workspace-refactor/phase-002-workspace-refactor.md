---
title: Workspace & Editor Refactor
phase_number: 2
status: draft
owner: engineering
parts:
  - part-001-workspace-layout
estimated_duration: 5 days
acceptance_criteria_count: 3
edge_cases_count: 2
---

# Phase 002: Workspace & Editor Refactor

## Strategy
Standardize the complex, multi-pane layouts of the Workspace and Editor routes to strictly utilize the new Layout and Control primitives.

## Acceptance Criteria
1. Project workspace modes use standard Shell and Panel components.
2. Editor surface uses consistent typography and selection states.
3. Hardcoded sizing in toolbars is replaced with tokens.

## Edge Cases
- Complex dragging/resizing interactions conflicting with strict primitive layouts.
- Preserving editor focus management.
