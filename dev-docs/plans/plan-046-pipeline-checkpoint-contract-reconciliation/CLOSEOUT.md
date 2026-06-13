# Plan-046 Closeout

Date: 2026-06-12
Status: implementation closed out; ready for plan-level reviewer evaluation

## Summary

Plan-046 reconciled pipeline checkpoint route ownership, schema versions,
legacy fixture behavior, and validation evidence across worldbuild,
worldbuilding scan proposals, author draft checkpoints, and outline draft
checkpoints.

## Completed Work

- Audited active checkpoint/proposal routes, schemas, and failing E2E specs.
- Documented canonical route ownership, lifecycle status/error behavior, and version policy in `dev-docs/03-ai/agents-map.md`.
- Updated stale Plan-028 worldbuild E2E fixtures to current `PipelineArtifactEnvelope` shape.
- Updated worldbuilding proposal accept/reject helpers and UI callbacks to include `projectId`.
- Added proposal service request-body coverage.
- Corrected active worldbuilding generation docs to distinguish staged checkpoint accept from scan proposal accept/reject routes.
- Confirmed no active caller depends on retired checkpoint contracts.

## Final Gates

- `pnpm check`: passed, 0 errors / 0 warnings.
- `pnpm lint`: passed.
- `pnpm lint:css`: passed.
- `pnpm check:tokens`: passed, 347 files scanned / 0 violations.
- `pnpm test`: passed, 241 files / 1762 tests.
- `pnpm test:e2e --project=chromium`: passed, 19 tests.

## Reviewer Focus

- Confirm the generic metadata lifecycle route remains canonical only for supported `vibe-worldbuild` staged checkpoints and outline list/read/review/reject compatibility.
- Confirm author draft and outline accept paths remain task-specific and review-gated.
- Confirm stale Plan-028 worldbuild fixture shapes were updated rather than adapted.
- Confirm worldbuilding scan proposal decisions require project context and do not fall back to global lookup.
- Confirm docs, route tests, and E2E fixtures agree on checkpoint schema/version policy.
