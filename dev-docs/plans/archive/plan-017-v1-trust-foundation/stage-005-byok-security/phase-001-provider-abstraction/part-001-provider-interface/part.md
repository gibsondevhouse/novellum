---
title: Provider Interface
slug: part-001-provider-interface
part_number: 1
status: complete
owner: ai
assigned_to: ai
phase: phase-001-provider-abstraction
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Define the canonical `AiProvider` TypeScript contract that every future model vendor must implement.

## Scope

**In scope:**

- `src/lib/ai/providers/types.ts` — exports `AiProvider`, `AiModel`, `CompletionRequest`, `CompletionResponse`, `StreamChunk`, `ValidateKeyResult`.
- The interface MUST require an explicit `apiKey` argument on every method that contacts the network — providers must not read credentials from any ambient store. Credential look-up belongs to phase-002.
- Brief in-file JSDoc explaining each method's intent.

**Out of scope:**

- Any concrete implementation — that's part-002.
- Any storage of API keys.

## Implementation Steps

1. Create `src/lib/ai/providers/types.ts`.
2. Define each interface method with strict TypeScript shapes; prefer discriminated unions for streamed chunk variants.
3. Expose a factory type `AiProviderFactory = (config?: AiProviderConfig) => AiProvider` for future DI.

## Files

**Create:**

- `src/lib/ai/providers/types.ts`

## Acceptance Criteria

- [ ] Interface compiles against `pnpm run check` with `strict: true`.
- [ ] No implementation file exists yet under `src/lib/ai/providers/` other than `types.ts`.
- [ ] `tests/ai/provider-types.test.ts` (type-only or snapshot) confirms the public surface area.

## Edge Cases

- Streamed responses must support cancellation (`AbortSignal` in the request shape).
- `validateKey` returns a discriminated result so callers can distinguish "invalid", "rate-limited", and "network error".

## Notes

- Source: [stage.md exit criteria](../../stage.md).
