---
title: Manifest Schema and Compatibility Policy
slug: part-001-manifest-schema-and-compatibility-policy
part_number: 1
status: draft
owner: backend
assigned_to: backend
phase: phase-001-backup-contract-and-versioning
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Define the archive manifest contract and compatibility policy that governs all backup imports. This is the authoritative portability protocol for V1.

## Scope

**In scope:**

- Define manifest TypeScript schema for portability archives
- Define compatibility rules for `formatVersion` and `dbSchemaVersion`
- Define failure-code taxonomy for invalid/incompatible backups
- Add service-level validation helpers

**Out of scope:**

- ZIP assembly or file I/O
- UI wiring for import/export actions

## Implementation Steps

1. Create manifest types in `src/modules/export/services/portability/types.ts`:
   - `PortabilityManifest`
   - `BackupPayloadIndex`
   - `CompatibilityResult`
   - `PortabilityErrorCode`

2. Create validation + compatibility service in `src/modules/export/services/portability/manifest-policy.ts`:
   - `validateManifestShape(manifest)`
   - `checkManifestCompatibility(manifest, runtime)`
   - `getCompatibilityMessage(code)`

3. Manifest required fields:
   - `formatVersion`
   - `exportedAt`
   - `appVersion`
   - `dbSchemaVersion`
   - `tableCounts`
   - `checksums`

4. Codify compatibility rules:
   - reject if backup `formatVersion` is higher than runtime-supported version
   - reject if backup `dbSchemaVersion` is higher than runtime schema version
   - allow equal versions
   - allow older versions only when required fields resolve safely

5. Add tests in `src/modules/export/services/__tests__/manifest-policy.test.ts` covering:
   - valid manifest
   - missing required fields
   - future format version
   - future db schema version
   - malformed counts/checksums

## Files

**Create:**

- `src/modules/export/services/portability/types.ts`
- `src/modules/export/services/portability/manifest-policy.ts`
- `src/modules/export/services/__tests__/manifest-policy.test.ts`

**Update:**

- `src/modules/export/index.ts` — export portability policy/types through module barrel

## Acceptance Criteria

- [ ] Manifest schema exists and is type-safe
- [ ] Compatibility policy enforces forward-version protection
- [ ] Validation surfaces explicit error codes/messages
- [ ] Tests cover all compatibility branches
- [ ] `pnpm run check` exits clean

## Edge Cases

- Manifest exists but nested payload references missing files
- `tableCounts` negative or non-integer values
- `checksums` present but empty strings

## Notes

> Keep this part implementation pure and deterministic. No browser APIs should be called in this layer.
