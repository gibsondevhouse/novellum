# Closeout Evidence

Date: 2026-06-12

## Implementation Summary

Plan-043 implementation is closed out and ready for a single plan-level reviewer pass.

## Retired Legacy Surfaces

- Write-mode outline prompts no longer call `runAuthorPipelineTask(AUTHOR_OUTLINE)`.
- `NovaOutlineCard` is read-only compatibility output and has no apply action.
- `src/modules/nova/services/outline-artifact-apply.ts` was deleted.
- `/api/nova/outline/apply` returns `410 outline_apply_retired` and contains no hierarchy replacement SQL.
- `NovaOutlineCard` is no longer exported from the Nova public barrel.

## Canonical Surfaces Preserved

- Write-mode outline generation routes through `outlineGenerationState.generate()`.
- `/api/ai/outline/generate` persists review checkpoints.
- `NovaOutlineDraftCheckpointCard` remains the explicit accept/reject UI.
- `/api/outline/checkpoints/{checkpointId}/accept` remains the only generated-outline hierarchy materialization route.
- Generic metadata accept for outline checkpoints remains blocked.

## Evidence Index

- Stage 001 call-site inventory:
  - `stage-001-surface-audit/phase-001-call-site-inventory/part-001-call-site-inventory/evidence/call-site-inventory-evidence-2026-06-12.md`
- Stage 001 contract risk map:
  - `stage-001-surface-audit/phase-002-contract-risk-map/part-001-contract-risk-map/evidence/contract-risk-map-evidence-2026-06-12.md`
- Stage 002 generation entrypoint:
  - `stage-002-canonical-checkpoint-flow/phase-001-generation-entrypoint/part-001-generation-entrypoint/evidence/generation-entrypoint-evidence-2026-06-12.md`
- Stage 002 review card wiring:
  - `stage-002-canonical-checkpoint-flow/phase-002-review-card-wiring/part-001-review-card-wiring/evidence/review-card-wiring-evidence-2026-06-12.md`
- Stage 002 materialization contract:
  - `stage-002-canonical-checkpoint-flow/phase-003-materialization-contract/part-001-materialization-contract/evidence/materialization-contract-evidence-2026-06-12.md`
- Stage 003 route retirement:
  - `stage-003-legacy-retirement/phase-001-route-retirement/part-001-route-retirement/evidence/route-retirement-evidence-2026-06-12.md`
- Stage 003 artifact card retirement:
  - `stage-003-legacy-retirement/phase-002-artifact-card-retirement/part-001-artifact-card-retirement/evidence/artifact-card-retirement-evidence-2026-06-12.md`
- Stage 003 compatibility notes:
  - `stage-003-legacy-retirement/phase-003-compatibility-notes/part-001-compatibility-notes/evidence/compatibility-notes-evidence-2026-06-12.md`
- Stage 004 targeted regression:
  - `stage-004-regression-and-docs/phase-001-targeted-regression/part-001-targeted-regression/evidence/targeted-regression-evidence-2026-06-12.md`
- Stage 004 docs sync:
  - `stage-004-regression-and-docs/phase-002-docs-sync/part-001-docs-sync/evidence/docs-sync-evidence-2026-06-12.md`

## Final Validation

- `pnpm check`: passed, 0 errors / 0 warnings.
- `pnpm lint`: passed.
- `pnpm lint:css`: passed.
- `pnpm check:tokens`: passed, 347 files scanned / 0 violations.
- `pnpm test`: passed, 240 files / 1760 tests.
- `pnpm test:e2e --grep "outline generation review gate" --project=chromium`: passed, 2 tests.

## Reviewer Handoff

- Focus review on the retired route/card behavior, the Write-mode checkpoint routing, and docs consistency.
- Reviewer should verify that no supported path can materialize generated outlines outside `acceptOutlineCheckpointMaterialization()`.
- Plan status is `review` rather than `complete` until that plan-level reviewer pass is done.
