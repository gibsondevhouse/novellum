---
title: OpenRouter Retry Refactor
slug: part-002-openrouter-retry-refactor
part_number: 2
status: review
owner: AI
assigned_to: AI
phase: phase-004-ai-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 1d
dependencies:
  - part-001-ai-config-constants
---

## Objective

> Refactor `src/lib/ai/openrouter.ts` (~300 lines) to extract the duplicated retry/backoff/error-handling logic into a reusable `withRetry()` utility function.

## Scope

**In scope:**

- Extract retry logic (exponential backoff, max retries, error classification)
- Create `src/lib/ai/utils.ts` with `withRetry<T>(fn, config)` generic utility
- Simplify `openrouter.ts` to use the extracted utility
- Ensure retry config (max attempts, backoff factor, retryable status codes) comes from `constants.ts`

**Out of scope:**

- Changing OpenRouter API integration
- Adding new retry strategies
- Modifying the model routing logic

## Implementation Steps

1. Identify all retry/backoff blocks in `openrouter.ts`
2. Create `src/lib/ai/utils.ts` with `withRetry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T>`
3. Define `RetryConfig` type in `src/lib/ai/types.ts`
4. Add retry constants to `src/lib/ai/constants.ts` (from Part 001)
5. Replace inline retry blocks in `openrouter.ts` with `withRetry()` calls
6. Write Vitest tests for `withRetry` utility
7. Verify existing AI tests still pass

## Files

**Create:**

- `src/lib/ai/utils.ts`
- `tests/ai/utils.test.ts`

**Update:**

- `src/lib/ai/openrouter.ts` — replace inline retry with `withRetry()`
- `src/lib/ai/types.ts` — add `RetryConfig` interface
- `src/lib/ai/constants.ts` — add retry config defaults
- `src/lib/ai/index.ts` — export utils

## Acceptance Criteria

- [ ] Zero duplicated retry blocks in `openrouter.ts`
- [ ] `withRetry` has dedicated Vitest coverage >= 80% line coverage
- [ ] Existing AI tests pass: `pnpm run test -- tests/ai/`
- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 errors
