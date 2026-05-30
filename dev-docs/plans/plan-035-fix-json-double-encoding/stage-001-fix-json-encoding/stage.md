---
title: Fix JSON Double-Encoding
slug: stage-001-fix-json-encoding
stage_number: 1
status: review
owner: Planner Agent
plan: plan-035-fix-json-double-encoding
phases:
  - phase-001-remove-pre-encoding-and-guards
  - phase-002-harden-server
  - phase-003-db-repair-and-tests
estimated_duration: 2d
risk_level: low
---

## Goal

Fix double-encoded JSON fields in the database and client code that cause TypeErrors and UI freezes. Remove pre-encoding at the source, add defensive type guards, harden the server, repair existing corrupt data, and add regression tests.

## Phases

| #   | Phase                                                                   | Status        | Est. Duration |
| --- | ----------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Source Fixes (Pre-encoding + Guards)](phase-001-remove-pre-encoding-and-guards/phase.md) | `review`      | 1d            |
| 002 | [Server Hardening](phase-002-harden-server/phase.md)                   | `review`      | 0.5d          |
| 003 | [DB Repair & Tests](phase-003-db-repair-and-tests/phase.md)             | `review`      | 0.5d          |

## Entry Criteria

- [ ] Branch `fix/json-double-encoding` created from `master`
- [ ] Plan documented with full scope and phase breakdown
- [ ] Team aware of critical freeze bug blocking Realms navigation

## Exit Criteria

- [ ] All phases marked `complete`
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm check`)
- [ ] All tests passing (`pnpm test`)
- [ ] Manual verification: Realms page navigates without freeze
- [ ] Manual verification: Individuals Dossier loads characters without crashes
- [ ] DB repair script successfully repairs corrupt rows

## Notes

- Phases 1 & 2 can be implemented in parallel (independent changes)
- Phase 3 (repair) should run before deployment
- All changes are application-level; no database migrations required
- The double-encoding bug only affects entities created via `GeneratedEntityModal`, not form-submitted entities
