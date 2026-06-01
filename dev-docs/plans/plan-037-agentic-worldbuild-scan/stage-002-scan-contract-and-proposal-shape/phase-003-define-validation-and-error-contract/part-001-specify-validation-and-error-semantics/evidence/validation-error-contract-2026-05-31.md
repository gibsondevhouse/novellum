# Evidence: Validation & Error Contract

- Date: 2026-05-31
- Part: `part-001-specify-validation-and-error-semantics`
- Scope: Define schema-validation and provider-error semantics for scan API and UI handling.

## Artifacts Created / Updated

### Created: `src/routes/api/worldbuilding/scan/+server.ts`

Defines the full scan endpoint error contract:

| Export | Kind | Purpose |
|--------|------|---------|
| `ScanErrorCode` | type | Stable union of 8 error codes |
| `SCAN_ERROR_USER_COPY` | const | User-safe copy keyed by error code — safe for UI display |
| `ScanErrorResponse` | interface | Typed error envelope: `{ code, message, details? }` |
| `ScanSuccessResponse` | interface | Typed success shape: `{ ok: true, proposals: [] }` |
| `statusForScanCode` | function | Maps error codes to HTTP status codes |
| `parseScanRequest` | function | Request body validator — returns null on malformed input |
| `POST` handler | route | Validates request + context, returns typed errors; returns 501 until Stage 003 wires execution |

### Error code taxonomy

| Code | HTTP | User-safe message | Developer diagnostics |
|------|------|-------------------|-----------------------|
| `invalid_request` | 400 | "Invalid scan request." | `hint` field with required fields |
| `no_credentials` | 401 | "No AI provider credentials configured." | — |
| `invalid_key` | 401 | "Invalid API key." | — |
| `rate_limit` | 429 | "AI provider rate limit reached." | — |
| `context_insufficient` | 422 | "Project context is incomplete." | `missing` array with field names |
| `schema_validation_failed` | 422 | "Scan response not in expected format." | — |
| `provider_error` | 502 | "AI provider error." | — |
| `scan_not_implemented` | 501 | Placeholder until Stage 003 wires execution | — |

### Updated: `src/routes/api/worldbuilding/generate/+server.ts`

Added cross-reference comment to scan endpoint after `noCredsResponse`. No logic changes.

### Updated: `dev-docs/03-ai/worldbuild-generation.md`

(See Stage 002 Phase 001 and Phase 002 evidence — docs updated with scan context + proposal schema sections.)

## Error Design Guardrails

- `SCAN_ERROR_USER_COPY` messages contain no internal detail (no keys, no model output, no paths).
- `details` field in `ScanErrorResponse` is for developer diagnostics only — UI must never render it raw.
- HTTP status codes follow the same conventions as `/api/worldbuilding/generate`: 401 for auth, 422 for semantic failures, 502 for upstream failures.
- `scan_not_implemented` (501) is the temporary stub code until Stage 003 connects the execution path.

## Quality Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm check` | 1 pre-existing ERROR (DomainCounts in +page.svelte, unrelated) | 1744 files (+2 new); no new errors |
| `pnpm test` | PASS — 203 files / 1472 tests | |

## Acceptance Criteria Verification

- [x] Validation failures return stable, typed error responses — `ScanErrorCode` union + `ScanErrorResponse` interface
- [x] Missing credentials and malformed model output follow existing provider patterns — codes mirror `/generate` endpoint (`no_credentials`, `invalid_key`, `rate_limit`, `provider_error`)
