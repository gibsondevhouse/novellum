---
title: Portability Docs and Recovery Runbook
slug: part-001-portability-docs-and-recovery-runbook
part_number: 1
status: draft
owner: planner
assigned_to: planner
phase: phase-002-docs-and-release-readiness
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Publish complete user/developer documentation for backup portability and create an operational runbook for troubleshooting failed imports.

## Scope

**In scope:**

- User docs for exporting/importing portability ZIPs
- Developer docs for archive contract and compatibility policy
- Recovery runbook for common import failures
- V1 release-note entry for portability feature

**Out of scope:**

- Deep support automation tooling
- Cloud sync documentation

## Implementation Steps

1. Update user-facing documentation:
   - `novellum-docs/docs/user-manual.md`
   - add "Backup and Restore" section with step-by-step flow

2. Update developer docs:
   - `dev-docs/architecture.md` (portability note under local-first strategy)
   - `dev-docs/tech-stack-docs.md` (archive format dependency and constraints)

3. Add runbook doc:
   - `dev-docs/portability-recovery-runbook.md`
   - include error code mapping and recovery actions

4. Add release notes entry in project docs as appropriate for V1 milestone

## Files

**Create:**

- `dev-docs/portability-recovery-runbook.md`

**Update:**

- `novellum-docs/docs/user-manual.md`
- `dev-docs/architecture.md`
- `dev-docs/tech-stack-docs.md`

## Acceptance Criteria

- [ ] User docs cover export/import and replace-only warning
- [ ] Developer docs describe manifest/version compatibility behavior
- [ ] Recovery runbook maps all defined portability error codes
- [ ] Release note text is drafted and reviewed
- [ ] `docs_sync` gate satisfied

## Edge Cases

- Users attempting import on older app versions
- Users restoring backups with unsupported future schema
- Users restoring into non-empty browser state without understanding replacement behavior

## Notes

> Documentation language must consistently use "manual portability backup" terminology to avoid implying auto-sync.
