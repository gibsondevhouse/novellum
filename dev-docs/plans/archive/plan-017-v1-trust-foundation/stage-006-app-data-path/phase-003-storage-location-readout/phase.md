---
title: Storage Location Settings Readout
slug: phase-003-storage-location-readout
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-006-app-data-path
parts:
  - part-001-storage-location-route
estimated_duration: 0.5d
---

## Goal

Expose a read-only `GET /api/settings/storage-location` route that
reports the current SQLite database path, app-data directory, backup
folder, log folder, and an estimated free-space figure. Stage-006's
exit gate.

## Parts

| #   | Part                                                                       | Status        | Assigned To | Est. Duration |
| --- | -------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [Storage Location Route](part-001-storage-location-route/part.md)          | `in-progress` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `GET /api/settings/storage-location` returns the resolver mode,
      DB path, app-data dir, backup dir, log dir, and a free-space
      estimate (`bytesFree`, `bytesTotal`).
- [ ] No credential value, secret, or environment variable contents
      appear in the response body or in any error path.
- [ ] `tests/routes/api-storage-location.test.ts` covers the happy
      path and the statfs failure fallback.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
