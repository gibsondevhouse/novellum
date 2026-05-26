---
title: Checksums
slug: part-001-checksums
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-backup-builder-and-checksums
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Provide a tiny, dependency-light SHA-256 helper used by both the backup builder and the restore validator.

## Scope

**In scope:**

- `src/lib/server/backup/checksums.ts`: `sha256(bytes: Uint8Array | string): string` and `buildChecksumsFile(entries: Record<string, Uint8Array>): { json: string; sha256: string }`.

**Out of scope:**

- Streaming hashing across very large files (V1 archives are well under 100MB; in-memory is fine).

## Implementation Steps

1. Implement `sha256` via Node's `crypto.createHash('sha256')`.
2. `buildChecksumsFile` produces `{ "<archive-relative-path>": "<hex>" }` sorted by key, JSON-stringified with stable indentation.
3. Add `tests/backup/checksums.test.ts`: stable JSON output for a fixed input; identical bytes → identical hash; small change → different hash.

## Files

**Create:**

- `src/lib/server/backup/checksums.ts`
- `tests/backup/checksums.test.ts`

## Acceptance Criteria

- [ ] Output is deterministic (sorted keys, stable indentation).
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Keep this file free of any backup-domain knowledge (no manifest/table awareness) so the restore side can reuse it for verification.
