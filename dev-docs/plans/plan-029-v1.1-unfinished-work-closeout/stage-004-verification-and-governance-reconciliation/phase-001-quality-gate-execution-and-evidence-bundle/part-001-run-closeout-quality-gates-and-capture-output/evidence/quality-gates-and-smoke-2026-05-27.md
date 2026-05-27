# Quality Gates and Smoke Results

> Executed: 2026-05-27

## Static Gates

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| typecheck | `pnpm check` | **PASS** | 1684 files, 0 errors, 0 warnings |
| lint | `pnpm lint` | **PASS** | 0 errors |
| lint:css | `pnpm lint:css` | **PASS** | 0 errors |
| tests | `pnpm test` | **PASS** | 187 files, 1270 tests passing (19.90s) |
| token guard | `pnpm check:tokens` | **PASS** | 325 files scanned, 0 violations |

## Plan-029 Quality Gate Checklist

| Gate | Status | Notes |
|------|--------|-------|
| lint | **PASS** | `pnpm lint` green |
| lint_css | **PASS** | `pnpm lint:css` green |
| typecheck | **PASS** | `pnpm check` green (0 errors, 0 warnings) |
| tests | **PASS** | 187/187 files, 1270/1270 tests |
| boundaries | **PASS** | ESLint boundaries included in `pnpm lint` |
| coverage_80_services_ai | **N/A** | No service/AI code touched by this plan (documentation-only) |
| e2e | **N/A** | No code changes to verify; existing Playwright specs unaffected |
| manual_smoke | **N/A** | No code changes; existing app behavior unchanged |
| docs_sync | **PASS** | roadmap.md, AGENTS.md dates rolled forward; ACTIVE/MASTER trackers reconciled |
| tracker_sync | **PASS** | ACTIVE-PLAN.md and MASTER-PLAN.md fully reconciled with plan-029 outcomes |

## Blocking Failures

None.
