---
title: OpenRouter Implementation
slug: part-002-openrouter-implementation
part_number: 2
status: complete
owner: ai
assigned_to: ai
phase: phase-001-provider-abstraction
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Implement the `AiProvider` interface against OpenRouter and replace the ad-hoc fetch calls scattered through `src/lib/ai/openrouter.ts`.

## Scope

**In scope:**

- `src/lib/ai/providers/openrouter-provider.ts` — implementation of `AiProvider`.
- `src/lib/ai/providers/index.ts` — barrel re-exports.
- Vitest suite `tests/ai/openrouter-provider.test.ts` covering all four methods against a mocked `fetch`.

**Out of scope:**

- Refactoring the runtime AI route (`src/routes/api/ai/+server.ts`) — that's phase-003.
- Storage / retrieval of API keys — phase-002.

## Implementation Steps

1. Create the provider file. Inject `fetch` for testability (default to `globalThis.fetch`).
2. Implement `validateKey(apiKey)` via `GET /api/v1/auth/key` (mask responses to never echo the supplied key).
3. Implement `listModels(apiKey)` via `GET /api/v1/models`.
4. Implement `complete(apiKey, request)` and `stream(apiKey, request)` against `/api/v1/chat/completions`.
5. Centralise the redactor used by error paths so test guardrails can assert no leaked key.
6. Write the test suite (mocked fetch, including a redaction case).

## Files

**Create:**

- `src/lib/ai/providers/openrouter-provider.ts`
- `src/lib/ai/providers/index.ts`
- `tests/ai/openrouter-provider.test.ts`

## Acceptance Criteria

- [ ] All four methods implemented and tested.
- [ ] Tests cover both happy and unhappy paths; redaction asserted on errors.
- [ ] No file outside `src/lib/ai/providers/**` issues a network call to OpenRouter directly.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- 4xx responses must surface a typed error without including the supplied API key in the message body.
- Streamed responses must be cancellable via `AbortSignal`.

## Notes

- Existing `src/lib/ai/openrouter.ts` is not removed in this part — it stays until phase-003 reduces it to a thin re-export.
