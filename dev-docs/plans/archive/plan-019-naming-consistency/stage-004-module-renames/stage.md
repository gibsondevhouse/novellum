---
title: Module Renames
slug: stage-004-module-renames
stage_number: 4
status: draft
owner: Architect Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-update-eslint-boundaries
  - phase-002-rename-module-folders
  - phase-003-update-import-paths-and-tests
estimated_duration: 1d
risk_level: medium
---

## Goal

Rename folders under `src/modules/` to match the canonical name
map, update the `$modules/*` alias map in `tsconfig.json`,
update `eslint-plugin-boundaries` element regexes, and migrate
every import path across the codebase and tests.

## Phases

| #   | Phase                                                                                                            | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Update eslint boundary patterns](phase-001-update-eslint-boundaries/phase.md)                                   | `draft` | 0.25d         |
| 002 | [Rename module folders](phase-002-rename-module-folders/phase.md)                                                | `draft` | 0.25d         |
| 003 | [Update import paths & tests](phase-003-update-import-paths-and-tests/phase.md)                                  | `draft` | 0.5d          |

## Entry Criteria

- Stage 003 complete; routes are using canonical names.

## Exit Criteria

- Every `src/modules/<old>` folder is renamed.
- `tsconfig.json` `paths` contains canonical `$modules/*` aliases
  only.
- `eslint.config.js` boundary `elements` regexes match the new
  paths.
- All imports across `src/` and `tests/` resolve.
- `pnpm run lint`, `pnpm run check`, `pnpm run test` all pass.

## Notes

- Phase 001 must land **before** any folder moves so the
  boundary lint actually fails on the rename pre-state and
  passes post-state. This is the proof that the regex was
  enforcing what we thought it was.
- Mirror module renames into the `tests/` tree so test paths
  match production paths.
