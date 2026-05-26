---
title: Barrel Audit & Fix
slug: phase-001-barrel-audit
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-005-barrel-cleanup
parts:
  - part-001-audit-fix-barrels
estimated_duration: 0.5d
---

## Goal

> Audit every module and library directory for barrel completeness. Create missing barrels, add missing exports to existing barrels, and ensure no deep imports bypass the barrel.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [Audit & Fix All Barrels](part-001-audit-fix-barrels/part.md) | `review` | Architect | 0.5d |

## Acceptance Criteria

- [ ] Every module directory has an `index.ts`
- [ ] Every `index.ts` exports all public types, constants, components, utils
- [ ] No deep imports from outside the module (enforced by boundaries plugin)
