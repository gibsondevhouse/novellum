---
title: Storage Location Route
slug: part-001-storage-location-route
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-003-storage-location-readout
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Ship the read-only storage-location API. The Settings UI for it lives
in plan-018; this part only exposes the data so that Settings has
something to render against.

## Files

**Create:**

- `src/routes/api/settings/storage-location/+server.ts`
- `tests/routes/api-storage-location.test.ts`

## Response Shape

```jsonc
{
    "mode": "dev" | "test" | "desktop" | "override",
    "databasePath": "string — absolute or project-relative",
    "appDataDirectory": "string",
    "backupDirectory": "string",
    "logDirectory": "string",
    "diskSpace": {
        "bytesFree": 12345,
        "bytesTotal": 67890
    } | null
}
```

`diskSpace` may be `null` when `fs.statfs` fails (e.g. unsupported
volume) — callers must handle the null shape gracefully.

## Acceptance Criteria

- [x] Route only emits `GET`.
- [x] No credential, key, or environment-variable contents appear in
      the response body or any error path.
- [x] Test covers happy path and the `statfs` failure fallback.
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.
