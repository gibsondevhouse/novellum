---
title: Audit & Fix All Barrels
slug: part-001-audit-fix-barrels
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-barrel-audit
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Systematically audit every module and library barrel (`index.ts`) file. Create missing barrels, populate incomplete barrels, and fix deep-import violations.

## Scope

**Target directories:**

| Directory | Current Barrel Status | Action Needed |
|---|---|---|
| `src/modules/workspace/` | Complete (gold standard) | None |
| `src/modules/outliner/` | Exists, may be incomplete | Verify all types/components exported |
| `src/modules/bible/` | Exists, may be incomplete | Add new constants/types from Stage 4 |
| `src/modules/editor/` | Exists, only exports types | Add components and constants |
| `src/modules/settings/` | MISSING | Create from scratch |
| `src/modules/consistency/` | Exists, missing repo export | Add consistency-repository |
| `src/modules/export/` | Exists, may be incomplete | Add new constants |
| `src/modules/project/` | Exists, may be incomplete | Add new constants |
| `src/lib/ai/` | Exists | Add constants, utils exports |
| `src/lib/components/` | Exists, only 5 components | Add UI/planning components |

## Implementation Steps

1. List all module directories: `find src/modules src/lib -maxdepth 1 -type d`
2. For each: check if `index.ts` exists
3. For missing: create barrel with all public exports
4. For existing: diff public files vs exported names, add missing
5. Run `pnpm run lint` — verify no `boundaries/` violations
6. Fix any deep-import violations surfaced by the lint

## Files

**Create:**

- `src/modules/settings/index.ts`

**Update:**

- `src/modules/editor/index.ts`
- `src/modules/consistency/index.ts`
- `src/lib/components/index.ts`
- `src/lib/ai/index.ts`
- Other barrels as needed

## Acceptance Criteria

- [ ] Every module has an `index.ts`
- [ ] `pnpm run lint` — 0 boundary violations
- [ ] `pnpm check` — 0 type errors
- [ ] No deep imports from outside a module
