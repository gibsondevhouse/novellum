---
title: Route + Client Refactor
slug: part-001-route-refactor
part_number: 1
status: complete
owner: ai
assigned_to: ai
phase: phase-003-openrouter-client-refactor
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Cut over the runtime AI route and the legacy `openrouter.ts` client to the new provider abstraction with no env-var fallback.

## Scope

**In scope:**

- Refactor `src/routes/api/ai/+server.ts` to look the key up via the server-side credential service, then call `OpenRouterProvider.complete` / `.stream`.
- Reduce `src/lib/ai/openrouter.ts` to a re-export of `providers/openrouter-provider` or delete it entirely if unused.
- Update `.env.example` to remove `VITE_OPENROUTER_API_KEY`.
- Extend `tests/ai/credential-redaction.test.ts` with a route-level case that POSTs to `/api/ai` with a fake key in the credential store and asserts the response/log/error paths never echo it.

**Out of scope:**

- The credential routes themselves — phase-004 part-001.

## Implementation Steps

1. In `+server.ts`, replace the env fallback with `await credentialService.loadProviderKey('openrouter')`. If absent, return `401` with `{code: 'no_credentials'}` (never include any key material).
2. Optionally retain a mock path guarded by `process.env.NOVELLUM_AI_MOCK === '1'` with a startup warning.
3. Reduce or delete `src/lib/ai/openrouter.ts`. Update any remaining callers to import from `src/lib/ai/providers/`.
4. Strip `VITE_OPENROUTER_API_KEY` from `.env.example`.
5. Extend the redaction suite.

## Files

**Update:**

- `src/routes/api/ai/+server.ts`
- `src/lib/ai/openrouter.ts` (or delete)
- `.env.example`
- `tests/ai/credential-redaction.test.ts`

## Acceptance Criteria

- [ ] No reference to `OPENROUTER_API_KEY` or `VITE_OPENROUTER_API_KEY` remains in `src/` or `.env.example`.
- [ ] Route returns `401 no_credentials` when the credential store is empty.
- [ ] Redaction test passes for the AI route.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- The credential service throws on a corrupt store — surface as `500 server_error`, not as a key-leaking message.
- Streamed errors mid-flight must not write the key into the SSE event payload.

## Notes

- This part finalises the "no key in env, no key in localStorage" rule for runtime.
