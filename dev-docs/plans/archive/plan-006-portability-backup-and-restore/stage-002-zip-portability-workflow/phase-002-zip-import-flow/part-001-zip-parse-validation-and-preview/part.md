---
title: ZIP Parse Validation and Preview
slug: part-001-zip-parse-validation-and-preview
part_number: 1
status: draft
owner: backend
assigned_to: backend
phase: phase-002-zip-import-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Parse uploaded portability archives, validate contract compatibility, and produce a preview summary before any destructive restore action is allowed.

## Scope

**In scope:**

- ZIP reader/parsing service
- Manifest extraction + validation
- Payload checksum verification
- Preview summary generation for UI confirmation

**Out of scope:**

- Actual database restore writes
- Final confirmation UX controls

## Implementation Steps

1. Create `src/modules/export/services/portability/zip-import-parse.ts` with:
   - `parseBackupArchive(file: File)`
   - `readManifest(zip)`
   - `verifyChecksums(zip, manifest)`
   - `buildPreviewSummary(zip, manifest)`

2. Integrate policy checks from Stage 001:
   - shape validation
   - compatibility checks
   - failure-code mapping

3. Build preview payload for UI:
   - project count
   - entity counts by table
   - exported timestamp
   - source app/schema versions

4. Add tests in `src/modules/export/services/__tests__/zip-import-parse.test.ts`:
   - happy path valid archive
   - corrupt/missing manifest
   - checksum mismatch
   - future format version rejection

## Files

**Create:**

- `src/modules/export/services/portability/zip-import-parse.ts`
- `src/modules/export/services/__tests__/zip-import-parse.test.ts`

**Update:**

- `src/modules/export/index.ts` — export import-parse service

## Acceptance Criteria

- [ ] Archive parser can read portability ZIP payloads
- [ ] Invalid archives fail before restore stage
- [ ] Preview summary includes counts and version metadata
- [ ] Checksum mismatch is detected and blocked
- [ ] `pnpm run check` exits clean

## Edge Cases

- ZIP contains unexpected extra files
- ZIP contains duplicate payload paths
- Manifest table count differs from actual payload rows

## Notes

> Parser output should be intentionally decoupled from UI components to keep validation testable and reusable.
