---
title: Credential Redaction Tests
slug: part-002-credential-redaction-tests
part_number: 2
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-005-model-selection-and-status
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Lock the BYOK Security stage with a comprehensive redaction test covering every surface a key could leak through.

## Scope

**In scope:**

- Extend `tests/ai/credential-redaction.test.ts` to assert a fixed sentinel API key (e.g. `sk-or-v1-TEST-SENTINEL-12345678`) does not appear in:
  - Any `/api/ai/**` or `/api/settings/**` JSON response body.
  - `.novellum` backup archives generated after `saveProviderKey`.
  - Captured `console.log/warn/error` output during a save → test → delete round-trip.
  - Server logs written through the project logging helper.
- A boundary test that scans `src/` for any literal `localStorage.getItem('novellum_openrouter_key')` or `localStorage.setItem('novellum_openrouter_key', ...)` and fails the build, with an explicit allowlist for the legacy migration shim.

**Out of scope:**

- Implementation of any new feature — this part is test-only.

## Implementation Steps

1. Add a sentinel constant the test owns; use it everywhere the test stores or transmits a key.
2. Spy on `console.*` methods within the test scope; restore in `afterEach`.
3. Generate a backup post-save and grep its contents (using the existing `parseBackup` helper).
4. Add the source-scan guardrail using the same `walk` helper as `tests/lib/legacy-dexie-boundaries.test.ts`.

## Files

**Update:**

- `tests/ai/credential-redaction.test.ts`

**Create:**

- `tests/lib/credential-localstorage-boundary.test.ts` (only if not already created in phase-002 part-002)

## Acceptance Criteria

- [ ] Sentinel never appears in any response payload, console capture, log, or backup archive.
- [ ] Source scan flags new `localStorage.{get,set}Item('novellum_openrouter_key', ...)` calls outside the allowlist.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Fetch streams (SSE) must be drained and inspected.
- Backup pipeline gzip path must be uncompressed before grepping.

## Notes

- This part is the **stage exit gate**. When it passes, stage-005 closes.
