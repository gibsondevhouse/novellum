---
title: Canonical Name Decisions
slug: phase-002-canonical-name-decisions
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-001-audit-and-canonical-name-map
parts:
  - part-001-draft-name-map
  - part-002-user-signoff
estimated_duration: 0.5d
---

## Goal

Take the inventory from phase 001 and decide a single canonical
name for each conflicted entry. Capture every decision in
`evidence/name-map.md` together with the rationale that drove
it, then secure user sign-off before any other stage starts.

## Parts

| #   | Part                                                            | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Draft name map](part-001-draft-name-map/part.md)               | `draft` | Planner     | 0.25d         |
| 002 | [User sign-off](part-002-user-signoff/part.md)                  | `draft` | Planner     | 0.25d         |

## Acceptance Criteria

- [ ] All parts reach `complete` status.
- [ ] `evidence/name-map.md` exists, has a row for every
      route + every module + every flagged component, and shows:
      current name, canonical name, rationale, redirect-required
      yes/no.
- [ ] User has explicitly approved the map (recorded in
      `impl.log.md` of part-002).

## Notes

- Where existing docs disagreed
  ([dev-docs/repo-structure.md](../../../../repo-structure.md)
  vs
  [dev-docs/routing-context.md](../../../../routing-context.md)),
  prefer the doc that was updated most recently and note the
  conflict in the rationale column.
