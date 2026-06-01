---
date: 2026-05-31
part: part-001-add-scan-contract-dedupe-and-api-test-coverage
---

# Quality Gate Results

## pnpm test

- **208 files / 1529 tests PASS** (up from 205/1489 pre-phase)
- 40 new tests added across 3 new test files

## New test files

### `tests/world-building/worldbuild-scan-contract.test.ts` (11 tests)
- `checkScanContextSufficiency`: all 3 required fields, whitespace-only, multi-missing
- `buildScanProjectContext`: only 5 allowed fields included, forbidden fields excluded
- `SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS`: systemPrompt, negativePrompt, sensitive metadata

### `tests/world-building/worldbuild-scan-dedupe.test.ts` (15 tests)
- `buildProposalDedupeKey`: lowercase normalization, whitespace collapsing, trim, category distinction
- `isDuplicateProposalKey`: exact match, empty set, case-sensitivity (pre-normalized)
- `clampConfidence`: 0/1 boundaries, above 1, below 0
- Constants: MIN_PROPOSAL_CONFIDENCE === 0.2, MAX_PROPOSALS_PER_SCAN === 5

### `tests/routes/worldbuilding-scan.test.ts` (14 tests)
| Path | Status | Error Code |
| --- | --- | --- |
| No valid JSON body | 400 | invalid_request |
| Missing projectId | 400 | invalid_request |
| Missing domainScope | 400 | invalid_request |
| Unknown domainScope | 400 | invalid_request |
| Missing context | 400 | invalid_request |
| Empty title | 422 | context_insufficient |
| Empty logline | 422 | context_insufficient |
| Empty synopsis | 422 | context_insufficient |
| Valid request (all 5 domains) | 501 | scan_not_implemented |
| Error body shape check | — | code + message present |
| Credential non-exposure check | — | no 'sk-' or 'systemPrompt' in body |

## High-risk failure modes covered
- `invalid_request`: malformed body, missing required fields, unrecognized domain
- `context_insufficient`: missing title/logline/synopsis (scan quality degraded)
- `scan_not_implemented`: endpoint contract returns 501 until Stage 003 scan execution is wired
