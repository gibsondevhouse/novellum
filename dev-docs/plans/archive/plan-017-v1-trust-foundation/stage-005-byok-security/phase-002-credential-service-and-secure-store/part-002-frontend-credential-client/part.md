---
title: Frontend Credential Client
slug: part-002-frontend-credential-client
part_number: 2
status: complete
owner: architect
assigned_to: architect
phase: phase-002-credential-service-and-secure-store
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Provide the single allowed frontend abstraction for credential management, replacing all direct `localStorage` reads of `novellum_openrouter_key`.

## Scope

**In scope:**

- `src/lib/ai/credential-service.ts` exporting `saveKey`, `deleteKey`, `getStatus`, `testKey` — all wrappers around the phase-004 routes.
- Drop-in replacement of all current `localStorage.getItem('novellum_openrouter_key')` and matching `setItem` call sites EXCEPT the legacy migration shim (one-shot, see Edge Cases).
- A boundary guardrail test asserting no module under `src/lib/ai/**` or `src/modules/settings/**` reads the legacy key from `localStorage`.

**Out of scope:**

- The actual API routes — phase-004 part-001.
- UI surface changes — phase-004 part-002.

## Implementation Steps

1. Implement the client (uses `apiPost` / `apiGet`).
2. Write a one-shot localStorage → server migration helper invoked once on credential-service module import: if `localStorage['novellum_openrouter_key']` exists, POST it to `/api/settings/ai-key` and `removeItem`. Log a redacted notice.
3. Replace direct `localStorage` access in `src/modules/settings/components/ApiSettings.svelte` and `src/lib/ai/openrouter.ts` with credential-service calls.
4. Add `tests/ai/credential-service.test.ts` and `tests/lib/credential-localstorage-boundary.test.ts`.

## Files

**Create:**

- `src/lib/ai/credential-service.ts`
- `tests/ai/credential-service.test.ts`
- `tests/lib/credential-localstorage-boundary.test.ts`

**Update:**

- `src/modules/settings/components/ApiSettings.svelte`
- `src/lib/ai/openrouter.ts`

## Acceptance Criteria

- [ ] No production code under `src/lib/ai/**` or `src/modules/settings/**` reads `novellum_openrouter_key` from `localStorage` (boundary test).
- [ ] One-shot migration runs at most once and clears the legacy key.
- [ ] Round-trip via the client works against a mocked `fetch`.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- The migration helper must be a no-op in non-browser contexts (SSR / vitest node env without `localStorage`).
- A failed migration POST must NOT clear the localStorage entry — keep the key locally until the next launch.

## Notes

- Depends on phase-004 part-001 routes; this part is implementable once the route stubs exist (or alongside, with the routes mocked in tests).
