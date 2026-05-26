---
phase: phase-005-ai-nova
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-11 02:15] Agent: Claude Code (acting as AI)

**Action:** Threaded a typed AI provider error end-to-end so the
named DoD codes `INVALID_KEY` and `RATE_LIMIT` produce the right
user-friendly message at every layer:

1. `src/lib/errors.ts` — added `AI_INVALID_KEY` and
   `AI_RATE_LIMIT` to the `ErrorCode` union and `ERROR_MESSAGES`
   table. Both messages include classifier-friendly substrings
   (`"invalid key"`, `"rate limit"`) so the existing
   `classifyNovaError` regex picks them up without modification.
2. `src/lib/ai/providers/types.ts` — exported a new
   `AiProviderErrorCode` discriminator (`'invalid_key' |
   'rate_limit' | 'provider_error'`) and an `AiProviderError`
   class carrying `code`, `status`, and the upstream message.
   Extended `StreamChunk`'s error variant with optional `status`
   + `code` so pre-stream HTTP failures carry the same info.
3. `src/lib/ai/providers/index.ts` — re-exported the new type
   and class.
4. `src/lib/ai/providers/openrouter-provider.ts` — added a
   `classifyStatus(status)` helper. `complete()` now throws
   `AiProviderError(classifyStatus(...), status, message)` for
   non-OK responses (replacing the old generic `throw new Error`).
   `stream()`'s pre-stream error chunk now carries `status` and
   `code` alongside the existing message.
5. `src/routes/api/ai/+server.ts` — added
   `statusForProviderCode(code, fallbackStatus)` and
   `providerErrorResponse(err)` helpers. The `complete` branch
   and the `handleTask` non-streaming path catch
   `AiProviderError` and return a real HTTP error response
   (401 / 429 / 502). The stream branch peeks the iterator's
   first chunk via
   `provider.stream(...)[Symbol.asyncIterator]().next()` so a
   pre-stream typed error becomes a real HTTP error response
   instead of being silently emitted as an SSE error event after
   the 200 response is constructed; if the first chunk is a
   normal value, it is replayed into the stream so no data is
   dropped.
6. `src/lib/ai/openrouter.ts` — added `readProxyError` and
   `throwMappedProxyError(response, body, surface)` helpers.
   `complete()` and `streamComplete()` collapse their previous
   per-method error blocks into a single call to the helper,
   which maps:
   - `401 + code 'no_credentials'` → existing
     `MissingCredentialsError`.
   - `code === 'invalid_key'` or any other `401` →
     `AppError('AI_INVALID_KEY')`.
   - `code === 'rate_limit'` or `429` →
     `AppError('AI_RATE_LIMIT')`.
   - Anything else → existing generic `Error('[OpenRouterClient]
     proxy ... failed: ...')`.

**Tests:**

- Five new tests in `tests/ai/openrouter.test.ts`:
  `complete` and `streamComplete` × `invalid_key` and
  `rate_limit`, plus the bare-401 fallback.
- Two new tests in `tests/nova/classify-nova-error.test.ts` to
  verify `classifyNovaError(new AppError('AI_INVALID_KEY'))` →
  `'invalid_key'` and the rate-limit equivalent.

**Result:**

- `pnpm check` (worktree): 1598 files, 0 errors.
- `pnpm lint`: clean.
- `pnpm lint:css`: clean.
- `pnpm check:tokens`: 312 files, 0 violations.
- `pnpm test`: **1040 / 1040** in 16.8s (was 1033 baseline +
  5 openrouter tests + 2 classifier tests = 1040, all
  contributed, zero regressions).
- Per-file `eslint` on the seven changed files: exit 0.

**Notes:**

- The error-map's user-facing messages now include literal
  `"invalid key"` and `"rate limit"` substrings. This couples
  the message text to the classifier's regex vocabulary —
  acceptable for V1, logged in `evidence/notes-2026-05-11.md`
  as a follow-up to clean up by having the classifier inspect
  `AppError.code` directly.
- Mid-stream errors that arrive as in-band SSE error events
  AFTER a 200 response still surface as plain `Error` (not
  `AppError`). These are rare in practice; the text-based
  classifier still picks them up. Listed in
  `evidence/notes-2026-05-11.md`.
- The `AiProvider` interface contract (`stream(): AsyncIterable<StreamChunk>`)
  is unchanged. The Ollama provider doesn't need an update;
  the iterator-peek pattern at the proxy layer absorbs the
  pre-stream error detection without forcing each provider
  to expose a separate pre-flight method.

**Result:** F4 (`INVALID_KEY` user-friendly message from
`error-map`) and F5 (`RATE_LIMIT` user-friendly retry message)
are closed end-to-end. Nova's `NovaErrorBoundary` already had
typed copy for `invalid_key` and `rate_limit` from a prior plan;
my changes ensure the new `AppError` codes route through the
classifier into that existing UI.

---

## [2026-05-11 02:30] Agent: Claude Code (acting as AI)

**Action:** Resolved follow-up item #1 from
`evidence/notes-2026-05-11.md` (error-map text coupled to the
classifier regex).

1. Updated
   [`src/modules/nova/utils/classify-nova-error.ts`](src/modules/nova/utils/classify-nova-error.ts)
   to inspect `AppError.code` directly via a new
   `classifyAppErrorCode()` helper. The legacy regex fallback is
   preserved for non-`AppError` inputs (raw `Error` objects from
   the `fetch` layer, mid-stream SSE error envelopes, etc.).
2. Reverted the awkward
   `"Invalid key — ..."` / `"Rate limit reached — ..."` prefixes
   in `src/lib/errors.ts`. The user-facing text is now back to
   the cleaner forms ("Your AI API key was rejected. ..." and
   "Too many AI requests. ...") without breaking classification.

**Result:**
- `npx vitest run tests/nova/classify-nova-error.test.ts tests/ai/openrouter.test.ts`:
  **28 / 28** still pass — the existing
  `classifyNovaError(new AppError('AI_INVALID_KEY'))` /
  `(new AppError('AI_RATE_LIMIT'))` tests now exercise the new
  code-based path rather than the regex fallback.
- Error-map text decoupled from classifier vocabulary; product
  copy can iterate on user-facing strings without breaking error
  routing.

**Notes:** `notes-2026-05-11.md` follow-up #1 is closed; #2
(mid-stream errors stay generic) and the Ollama-provider parity
(#4) remain open as documented limitations for V1.

---

## [2026-05-26 12:00] Agent: Reviewer Agent (GitHub Copilot)

**Reviewer sign-off.** Walked the checklist + evidence + linked
source files for this phase. All implementation and post-impl
boxes are checked, the evidence file cites DoD line items by
identifier, and the test counts in the log match the current
suite size on master. Phase status flipped `review` → `complete`.

**No outstanding actions.** Documented limitations / follow-ups
in the phase's `evidence/notes-*.md` (where present) are
explicitly post-V1 and do not block closeout.

---
