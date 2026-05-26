---
title: Project, Consistency & Settings Extraction
slug: part-001-project-consistency-settings
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-005-remaining-modules
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Extract constants and types from the project, consistency, and settings modules. Create the missing `src/modules/settings/index.ts` barrel file.

## Scope

**In scope:**

- `src/modules/project/` — extract any duplicated project-level constants (project statuses, default values)
- `src/modules/consistency/` — fix missing consistency-repository export in barrel, extract validation constants
- `src/modules/settings/` — create `index.ts` barrel file (currently DOES NOT EXIST)

**Out of scope:**

- Major refactoring of module logic
- Changing module boundaries

## Implementation Steps

1. Audit project module: `grep -rn "const.*=" src/modules/project/`
2. Create `src/modules/project/constants.ts` if inline constants found
3. Audit consistency module: check barrel, extract validation constants
4. Update `src/modules/consistency/index.ts` to export consistency-repository
5. Create `src/modules/settings/index.ts` barrel with all public exports
6. Audit settings module for extractable constants

## Files

**Create:**

- `src/modules/settings/index.ts`
- `src/modules/project/constants.ts` (if needed)

**Update:**

- `src/modules/consistency/index.ts` — add missing exports
- Project/settings components with inline constants

## Acceptance Criteria

- [ ] `src/modules/settings/index.ts` exists and exports all public items
- [ ] `src/modules/consistency/index.ts` exports consistency-repository
- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 boundary violations
