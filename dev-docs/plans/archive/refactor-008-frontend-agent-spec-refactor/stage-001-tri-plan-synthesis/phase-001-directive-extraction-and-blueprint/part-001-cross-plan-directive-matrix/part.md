---
title: Cross-Plan Directive Matrix
slug: part-001-cross-plan-directive-matrix
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-directive-extraction-and-blueprint
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Build a complete directive matrix that captures what each source plan requires from the frontend agent contract and where those requirements overlap or conflict.

## Scope

**In scope:**

- Extracting directives from the three source plans
- Categorizing directives by architecture, UX, quality, and workflow
- Priority ranking and conflict annotations

**Out of scope:**

- Editing `.github/agents/frontend.agent.md`
- Runtime code changes

## Implementation Steps

1. Extract all explicit mandates from refactor-006, refactor-007, and linearization-overhaul.
2. Group directives by concern area (surface consistency, tokens/primitives, accessibility, quality discipline, execution protocols).
3. Mark overlaps, contradictions, and dependency links.
4. Produce a resolved priority order for Stage 002 consumption.

## Files

**Create:**

- `dev-docs/plans/refactor-008-frontend-agent-spec-refactor/stage-001-tri-plan-synthesis/phase-001-directive-extraction-and-blueprint/part-001-cross-plan-directive-matrix/evidence/directive-matrix.md`

**Update:**

- `dev-docs/plans/refactor-008-frontend-agent-spec-refactor/stage-001-tri-plan-synthesis/phase-001-directive-extraction-and-blueprint/part-001-cross-plan-directive-matrix/impl.log.md`

## Acceptance Criteria

- [ ] Every major mandate in the three source plans is represented in the matrix
- [ ] Conflict-resolution notes are explicit and actionable
- [ ] The matrix supports direct translation into frontend agent sections

## Edge Cases

- Ambiguous directives that blend style guidance and hard policy requirements
- Duplicate mandates stated with different terminology

## Notes

- Treat production-safety and quality-gate requirements as non-negotiable baseline constraints.
