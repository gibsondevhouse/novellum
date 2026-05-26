---
title: Roundtrip Tests and Guardrails
slug: part-001-roundtrip-tests-and-guardrails
part_number: 1
status: draft
owner: reviewer
assigned_to: reviewer
phase: phase-001-roundtrip-testing-and-safety
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Validate portability reliability by proving data parity after export/import roundtrip and enforcing safeguards against known restore failures.

## Scope

**In scope:**

- Automated tests for archive build/parse/restore roundtrip
- Negative tests for incompatibility and corruption
- Safety assertions for atomic restore behavior
- Manual QA script for browser A -> browser B transfer

**Out of scope:**

- Performance benchmarking infrastructure beyond baseline checks
- Merge-import test matrix

## Implementation Steps

1. Add portability roundtrip test suite:
   - `tests/portability/backup-roundtrip.test.ts`
   - create fixture dataset
   - export archive
   - parse/import archive into clean DB
   - assert entity counts/content parity

2. Add negative tests:
   - corrupt ZIP
   - missing manifest
   - unsupported version
   - checksum mismatch

3. Add restore atomicity tests:
   - induced failure mid-restore must rollback all writes

4. Add manual QA checklist artifact in evidence folder:
   - Browser A export
   - Browser B import
   - verify projects and planning fields

## Files

**Create:**

- `tests/portability/backup-roundtrip.test.ts`
- `tests/portability/backup-failure-modes.test.ts`

**Update:**

- `vitest.config.ts` — include portability tests if path configuration is needed

## Acceptance Criteria

- [ ] Roundtrip tests pass with deterministic assertions
- [ ] Failure mode tests block invalid archives safely
- [ ] Atomic restore rollback is verified
- [ ] Manual QA scenario executed and captured in evidence
- [ ] `pnpm run test` exits clean

## Edge Cases

- Archives with sparse tables (some empty, some populated)
- Unicode/special characters in titles and notes
- High volume scene snapshot table payload

## Notes

> Parity assertions should check representative content values, not just row counts.
