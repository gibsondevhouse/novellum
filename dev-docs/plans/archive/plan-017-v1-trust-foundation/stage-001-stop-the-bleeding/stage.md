---
title: Stop the Bleeding
slug: stage-001-stop-the-bleeding
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases: []
estimated_duration: 2d
risk_level: low
---

## Goal

Eliminate the most acute trust hazards in the current codebase before deeper refactors begin: stop logging credential previews, prevent Dexie-backed export from being misrepresented as a complete backup, harden repo hygiene, and stand up a basic CI gate.

## Phases

> Phases to be decomposed during planner-agent breakdown. Suggested grouping:
>
> - phase-001-credential-logging-removal
> - phase-002-export-warning-and-repo-hygiene
> - phase-003-basic-ci-pipeline

## Entry Criteria

- Plan-017 approved.
- No conflicting in-flight branches modifying `src/lib/ai/openrouter.ts`, `src/modules/settings/components/ApiSettings.svelte`, or `.gitignore`.

## Exit Criteria

- `console.log('[OpenRouterClient] Stream request with API key:', keyPreview)` and any equivalent credential logging is removed.
- A failing-by-default test (`tests/ai/credential-redaction.test.ts`) asserts no key material reaches console/log sinks or API responses.
- `ExportModal.svelte` and `ImportBackupDialog.svelte` carry accurate scope warnings that do not promise SQLite-backed completeness while Dexie is still the source.
- `.gitignore` adds `coverage/` and removes the broad `.github/*` ignore (keeping targeted ignores for generated/private files).
- `.github/workflows/ci.yml` runs `pnpm run check`, `pnpm run lint`, `pnpm run lint:css`, `pnpm run test`, and `pnpm run build` on PRs to `master`.
- All quality gates pass on the resulting CI run.

## Notes

- Source: [market-readiness-pt1.md §7, §12, §14 (Phase 1)](../../research/market-readiness-pt1.md).
- Do not attempt to fix the underlying credential storage in this stage — only remove leakage and add the redaction test. Storage refactor lives in Stage 005.
- Do not attempt to switch backup to SQLite in this stage — only correct misleading copy. Backup refactor lives in Stage 004.
