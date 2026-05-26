---
phase: phase-005-ai-nova
last_updated: 2026-05-11
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent stage and plan are `in-progress`
- [x] Phase-001 triage identifies F4 + F5 as in-scope hard failures
- [x] Phase-001 baseline confirms `pnpm test` is fully green
      pre-change (so any regression here is real)
- [x] Sourcing approach decided: thread typed `AiProviderError` from
      provider → proxy → client (preserve code at every hop) and
      include classifier-friendly text in error-map messages

## Implementation

- [x] `AI_INVALID_KEY` and `AI_RATE_LIMIT` codes added to
      `src/lib/errors.ts`
- [x] `AiProviderError` class + `AiProviderErrorCode` type added to
      `src/lib/ai/providers/types.ts`; barrel updated
- [x] `OpenRouterProvider.complete()` throws typed errors for
      401/403/429
- [x] `OpenRouterProvider.stream()` yields error chunks tagged
      with `status` + `code` for the pre-stream HTTP failure path
- [x] `/api/ai` `complete` and `handleTask` branches catch
      `AiProviderError`; helper functions
      `statusForProviderCode` + `providerErrorResponse` introduced
- [x] `/api/ai` stream branch peeks first iterator chunk for
      typed errors; replays peeked chunk into the stream when
      not an error
- [x] Browser `OpenRouterClient.complete()` and
      `streamComplete()` use `throwMappedProxyError` to map
      response status + code to `AppError` /
      `MissingCredentialsError`
- [x] Five new tests in `tests/ai/openrouter.test.ts` cover
      complete + stream × invalid_key + rate_limit + bare-401
- [x] Two new tests in `tests/nova/classify-nova-error.test.ts`
      verify the AppError → classifier mapping

## Post-Implementation

- [x] `pnpm check` clean (1598 files, 0 errors)
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] `pnpm check:tokens` clean (312 files, 0 violations)
- [x] `pnpm test` 1040 / 1040 (was 1033 baseline + 7 new tests)
- [x] Evidence file (`evidence/ai-nova-2026-05-11.md`) with code
      citations + DoD line-item verification
- [x] Notes / known limitations file
      (`evidence/notes-2026-05-11.md`)
- [x] `impl.log.md` updated with final entry
- [x] Phase status set to `review` in `phase.md` frontmatter
- [x] Reviewer notified / Reviewer Agent invoked  <!-- closed 2026-05-26: signed off in impl.log.md -->
