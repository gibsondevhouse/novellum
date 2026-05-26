---
title: AI (Nova) — INVALID_KEY + RATE_LIMIT error mapping
slug: phase-005-ai-nova
phase_number: 5
status: complete
owner: AI Agent
stage: stage-001-dod-verification
parts: []
estimated_duration: 0.25d
closed: 2026-05-26
---

## Goal

Close DoD failures **F4** and **F5** identified in the phase-001
triage:

- **F4** — `INVALID_KEY` error surfaces the user-friendly message
  from `error-map`.
- **F5** — `RATE_LIMIT` error surfaces the user-friendly retry
  message.

Make the entire AI request pipeline (provider → proxy → browser
client → Nova UI) honor these two named codes end-to-end so a
user with a bad key or a rate-limited key sees the right friendly
message instead of `[OpenRouterClient] proxy stream failed: 502`
or similar.

## Acceptance Criteria

- [x] `src/lib/errors.ts` exports `AI_INVALID_KEY` and
      `AI_RATE_LIMIT` codes with friendly user-facing messages.
- [x] `OpenRouterProvider.complete` and `OpenRouterProvider.stream`
      surface upstream 401/403/429 as a typed `AiProviderError`
      (or, for stream, an error chunk carrying `code` + `status`).
- [x] `/api/ai` proxy maps `AiProviderError` onto a real HTTP
      status (401 / 429) with `{ error: { code, message } }` body.
- [x] `/api/ai` stream branch peeks the iterator's first chunk so
      pre-stream auth/rate-limit failures return as a real HTTP
      error response (not a 200 with an SSE `error` event after
      the response is constructed).
- [x] Browser `OpenRouterClient` (`complete` and `streamComplete`)
      maps proxy responses onto `AppError(AI_INVALID_KEY)` /
      `AppError(AI_RATE_LIMIT)`, with `MissingCredentialsError`
      preserved for the existing "no key configured" case.
- [x] Nova `classifyNovaError` correctly classifies the new
      `AppError` instances as `invalid_key` / `rate_limit` so the
      `NovaErrorBoundary` shows the right typed notice.
- [x] Unit tests cover all four new mapping paths (complete +
      stream × invalid_key + rate_limit) plus the AppError →
      classifier mapping.
- [x] All five quality gates (`pnpm check`, `pnpm lint`,
      `pnpm lint:css`, `pnpm check:tokens`, `pnpm test`) green
      from the worktree after the changes.

## Files Changed

**Updated:**
- `src/lib/errors.ts` — added `AI_INVALID_KEY` + `AI_RATE_LIMIT`
  codes and user-facing messages (the messages contain
  `invalid key` / `rate limit` text so the existing
  `classifyNovaError` regex picks them up cleanly).
- `src/lib/ai/providers/types.ts` — added `AiProviderErrorCode`
  type + `AiProviderError` class. Extended the `error` variant of
  `StreamChunk` with optional `status` and `code`.
- `src/lib/ai/providers/index.ts` — re-exports the new type and
  class.
- `src/lib/ai/providers/openrouter-provider.ts` — `complete()`
  now throws `AiProviderError` with the right code/status;
  `stream()` yields error chunks tagged with status + code.
- `src/routes/api/ai/+server.ts` — added
  `statusForProviderCode` + `providerErrorResponse` helpers; the
  `complete` and `handleTask` branches catch `AiProviderError`;
  the stream branch peeks the iterator's first chunk and returns
  a JSON error response if the chunk is a typed error.
- `src/lib/ai/openrouter.ts` — added `readProxyError` +
  `throwMappedProxyError` helpers; `complete()` and
  `streamComplete()` use them to map response status + code to
  `AppError` / `MissingCredentialsError`.

**Updated tests:**
- `tests/ai/openrouter.test.ts` — five new tests:
  - `complete` maps 401 invalid_key → `AppError('AI_INVALID_KEY')`.
  - `complete` maps 429 rate_limit → `AppError('AI_RATE_LIMIT')`.
  - `complete` maps a bare 401 (no `code`) to `AppError('AI_INVALID_KEY')` (not `MissingCredentials`).
  - `streamComplete` maps pre-stream 401 invalid_key → `AppError('AI_INVALID_KEY')`.
  - `streamComplete` maps pre-stream 429 rate_limit → `AppError('AI_RATE_LIMIT')`.
- `tests/nova/classify-nova-error.test.ts` — two new tests:
  - `classifyNovaError(new AppError('AI_INVALID_KEY'))` → `'invalid_key'`.
  - `classifyNovaError(new AppError('AI_RATE_LIMIT'))` → `'rate_limit'`.

## Notes

- The full chain has four layers (provider → proxy → client →
  Nova). The phase touches all four because each layer was
  flattening the failure information at a different point: the
  provider was `throw new Error(string)`; the proxy was
  `JSON.stringify({code: 'provider_error', message})`; the client
  was `throw new Error('[OpenRouterClient] proxy ...')`; Nova
  classifier was regex-matching the result against `/401|invalid.?key/`.
  The chain now preserves the typed code at every hop.
- The error-map messages intentionally include the literal text
  `"invalid key"` and `"rate limit"` so the existing
  `classifyNovaError` regex picks them up without modification.
  This couples the error-map text to the classifier's vocabulary
  — acceptable for V1; the longer-term cleanup is to have the
  classifier inspect `AppError.code` directly. Logged in
  `evidence/notes-2026-05-11.md`.
- The streaming-pre-flight is implemented via iterator peek
  (`provider.stream(...)[Symbol.asyncIterator]().next()`) rather
  than refactoring the `stream()` interface to return
  `Promise<AsyncIterable<>>`. Cleaner — the `AiProvider`
  interface contract is unchanged and Ollama doesn't need an
  update.
- `MissingCredentialsError` is preserved as a separate class
  (not an `AppError`) because there are existing UI consumers
  that `instanceof`-check it.
- Mid-stream errors (which arrive as in-band SSE error events
  AFTER a 200 response) still surface as plain `Error` (not
  `AppError`). Acceptable for V1 — these are rare and the
  text-based classifier still picks them up. Listed as a known
  limitation in `evidence/notes-2026-05-11.md`.
