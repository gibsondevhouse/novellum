---
title: Project module token enforcement
slug: part-007-project-token-enforcement
part_number: 7
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-module-token-remediation
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace hardcoded color, spacing, and border styling in the Project module with approved design tokens.

## Scope

**In scope:**

- Sweep Project module Svelte and CSS files for token violations and remediate them

**Out of scope:**

- Primitive migration logic is tracked in Stage 003

## Implementation Steps

1. Run targeted grep scans for raw hex, raw spacing units, and non-token border declarations
2. Replace violations with approved token variables from src/styles/tokens.css
3. Capture before/after grep output evidence showing zero remaining scoped violations

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-002-design-token-enforcement/phase-001-module-token-remediation/part-007-project-token-enforcement/evidence/

**Update:**

- src/modules/project/**; src/routes/projects/**; src/styles/**

## Acceptance Criteria

- [ ] Scoped Project module has zero hardcoded token violations in defined grep checks.
- [ ] Visual parity is maintained with no route render regressions.

## Edge Cases

- Some third-party component styles may require wrapper tokenization rather than direct edits.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
