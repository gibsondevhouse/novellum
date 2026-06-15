# Route Retirement Evidence

Date: 2026-06-12

## Summary

`/api/nova/outline/apply` is retired with an explicit unsupported response. It no longer performs hierarchy replacement.

## Changes

- `src/routes/api/nova/outline/apply/+server.ts`
  - Replaced destructive SQLite materialization logic with a stable `410` response.
  - Response code: `outline_apply_retired`.
  - Response copy directs callers to generate and accept outline checkpoints.
- `src/modules/nova/services/outline-artifact-apply.ts`
  - Deleted. No active supported UI calls the retired route.
- `tests/routes/nova-outline-apply-route.test.ts`
  - Replaced legacy materialization tests with retired-route tests.
  - Added a source contract that the route no longer imports database helpers or contains hierarchy replacement SQL.

## Acceptance Criteria

- Legacy route no longer performs hierarchy replacement:
  - The route contains no `db.prepare`, `DELETE FROM`, `INSERT INTO`, or `randomUUID` usage.
- No active caller expects the retired route:
  - The apply helper was deleted.
  - The legacy card no longer imports the helper.
- Failure behavior is explicit:
  - The route returns `410 outline_apply_retired` for valid and malformed legacy payloads.

## Validation

- `pnpm test tests/routes/nova-outline-apply-route.test.ts`
  - Result: passed as part of the targeted route/card runs.
