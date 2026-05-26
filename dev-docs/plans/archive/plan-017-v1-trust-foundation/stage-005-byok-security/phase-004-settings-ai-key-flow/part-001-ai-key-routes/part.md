---
title: AI Key Routes
slug: part-001-ai-key-routes
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-004-settings-ai-key-flow
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Implement the HTTP surface that the frontend credential client (phase-002 part-002) and the Settings UI (phase-004 part-002) consume.

## Scope

**In scope:**

- `src/routes/api/settings/ai-key/+server.ts` — `POST` handler accepting `{ providerId, apiKey?, action }`.
  - `action: 'save'` → persist via `credentialService.saveProviderKey`.
  - `action: 'delete'` → call `deleteProviderKey`.
  - `action: 'test'` → call `OpenRouterProvider.validateKey` against the supplied or stored key, never persisting the transient key.
- `src/routes/api/settings/ai-status/+server.ts` — `GET` returning `getProviderStatus(providerId)` payload.
- Validation: reject empty `providerId`, unknown `action`, or `apiKey` shorter than 16 chars on save.
- Redaction: every error response strips `apiKey` from the body and logs.

**Out of scope:**

- Persistence implementation — phase-002 part-001.
- UI — phase-004 part-002.

## Implementation Steps

1. Implement the two route handlers using the SvelteKit `RequestHandler` shape; reuse the existing JSON-error helpers.
2. Wire the credential service via dynamic import so test files can `vi.mock` the module without server bootstrapping.
3. Vitest suite `tests/routes/api-ai-key.test.ts` covering all four flows + redaction.

## Files

**Create:**

- `src/routes/api/settings/ai-key/+server.ts`
- `src/routes/api/settings/ai-status/+server.ts`
- `tests/routes/api-ai-key.test.ts`

## Acceptance Criteria

- [ ] All four flows (`save`, `delete`, `test`, `status`) round-trip via Vitest using a temp-directory secure store.
- [ ] No response body contains the supplied `apiKey`.
- [ ] Validation errors return `400` with a code, never the offending key fragment.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- `test` with no stored key and no supplied key → `400 no_credentials_to_test`.
- Very long key value (>4 KB) → `413 payload_too_large`.

## Notes

- The lifecycle here is intentionally narrow; multi-provider configuration arrives later. V1 only writes `providerId === 'openrouter'`.
