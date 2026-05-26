---
title: Create Factory & Migrate Repositories
slug: phase-001-create-factory
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-001-repository-factory
parts:
  - part-001-repository-factory-impl
  - part-002-migrate-repositories
estimated_duration: 1.5d
---

## Goal

> Create the generic repository factory function and migrate all 18 repository files to use it.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [Repository Factory Implementation](part-001-repository-factory-impl/part.md) | `draft` | Architect | 0.5d |
| 002 | [Migrate All Repositories](part-002-migrate-repositories/part.md) | `draft` | Architect | 1d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Factory supports Tier 1 (standard CRUD), Tier 2 (CRUD + reorder), and Tier 3 (CRUD + custom extensions)
- [ ] All 18 repository files use the factory
- [ ] No behavior changes — same function signatures, same API calls
