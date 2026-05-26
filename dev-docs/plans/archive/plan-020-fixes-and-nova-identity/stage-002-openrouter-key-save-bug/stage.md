---
title: OpenRouter Key Save Bug
slug: stage-002-openrouter-key-save-bug
stage_number: 2
status: complete
owner: Backend Agent
plan: plan-020-fixes-and-nova-identity
phases:
  - phase-001-verify-fix
  - phase-002-regression-test
estimated_duration: 0.5d
risk_level: low
---

## Goal

Confirm that the OpenRouter API key save path — introduced by plan-022's `ApiSettings.svelte` relocation — correctly persists via `/api/settings/ai-key`, survives a full app restart, and is covered by a server-level save→read round-trip regression test.

## Context (already in tree — do not duplicate)

- The original bug lived in `src/routes/settings/+page.svelte` (broken save path). **That file was replaced by plan-022.**
- `src/routes/settings/ai/+page.svelte` now renders `<ApiSettings />` from `$modules/settings`.
- `src/modules/settings/components/ApiSettings.svelte` calls `saveKey(providerId, apiKey)` from `$lib/ai/credential-service.ts`.
- `saveKey` POSTs `{ providerId, apiKey, action: 'save' }` to `/api/settings/ai-key` (server route from plan-017 stage-005).
- Server handler persists to SQLite `secrets` table via `KeyringStore`.
- **Save→read round-trip already tested at the server level:** `tests/routes/api-ai-key.test.ts` line 177 calls `aiKey.POST` (action=save) then `aiStatus.GET` and asserts `configured=true` + masked hint.
- **Client-side `saveKey` unit-tested:** `tests/ai/credential-service.test.ts` verifies the correct POST body and a 2xx response.
- All 846 tests passing as of the current baseline.

## Exit Criteria

- Save path traced end-to-end and confirmed correct: `ApiSettings.svelte` → `saveKey()` → `POST /api/settings/ai-key` → `KeyringStore` → SQLite.
- No gap exists in the save→read round-trip coverage (server-level test at `tests/routes/api-ai-key.test.ts` line 177 is sufficient; document the finding).
- `pnpm run test` — all tests pass, no regression.
- `pnpm run lint` — zero boundary violations.
- Manual smoke note recorded: paste a key in `/settings/ai`, click Save, restart app, re-open settings, confirm key is still present (masked hint visible).

## Phases

### Phase-001 — Verify fix

**Goal:** Trace the complete save path from `ApiSettings.svelte` through to the SQLite write. Confirm plan-022 resolved the original bug and no broken path remains.

**Files (read-only verification):**

- `src/modules/settings/components/ApiSettings.svelte` — confirm it imports `saveKey` from `$lib/ai/credential-service.js` and calls it on submit.
- `src/lib/ai/credential-service.ts` — confirm `saveKey` POSTs to `/api/settings/ai-key` with `{ providerId, apiKey, action: 'save' }`.
- `src/routes/api/settings/ai-key/+server.ts` — confirm POST handler delegates to `KeyringStore` and returns a `ProviderStatus` body.
- `tests/routes/api-ai-key.test.ts` — confirm the save→read round-trip test at line 177 exists and passes.

**Acceptance checklist:**

- [ ] `ApiSettings.svelte` imports `saveKey` from `$lib/ai/credential-service.js` (not from any other path).
- [ ] `saveKey` body contains `action: 'save'` (confirmed by `tests/ai/credential-service.test.ts` saveKey assertion).
- [ ] Server POST handler is wired to `KeyringStore` — verified by reading `+server.ts`.
- [ ] `tests/routes/api-ai-key.test.ts` line 177 ("returns configured=true with masked hint after save") passes.
- [ ] `pnpm run test -- tests/routes/api-ai-key.test.ts tests/ai/credential-service.test.ts` exits 0.

### Phase-002 — Regression test gap analysis

**Goal:** Determine whether a dedicated client-layer save→read round-trip test is needed in `tests/lib/ai/credential-service.test.ts`, or whether the existing server-level test provides sufficient regression coverage. Add a test only if a gap exists.

**Decision point:** The server-level test (`api-ai-key.test.ts` line 177) exercises the complete round-trip through the real server handler + `KeyringStore`. The client-side `saveKey` test already verifies the fetch call shape. A separate client-layer round-trip test would only mock both `saveKey` and `getStatus` fetch calls against each other — adding marginal value. **Verdict: no new test required.** Document this decision as a finding.

**Files (if a gap is found — conditional):**

- `tests/lib/ai/credential-service.test.ts` (new, only if gap confirmed) — mock `fetch` to return a `save` response, then call `getStatus` with the same mock returning `configured: true`; assert the status reflects the saved state.

**Acceptance checklist:**

- [ ] Gap analysis documented: confirm whether `tests/routes/api-ai-key.test.ts` line 177 is sufficient.
- [ ] If no gap: add a comment in the phase impl log recording the decision.
- [ ] If gap found: new test file created and passing before marking phase complete.
- [ ] `pnpm run test` — all 846+ tests pass.
- [ ] `pnpm run lint` — zero boundary violations.
- [ ] Manual smoke note: record the result of pasting a real (or test-format) key, restarting, and confirming persistence.

## Out of Scope

- Modifying `ApiSettings.svelte` UI or UX beyond what is strictly needed to confirm the save path.
- Adding support for providers other than `openrouter`.
- Changes to the `KeyringStore` implementation or the `secrets` table schema.
