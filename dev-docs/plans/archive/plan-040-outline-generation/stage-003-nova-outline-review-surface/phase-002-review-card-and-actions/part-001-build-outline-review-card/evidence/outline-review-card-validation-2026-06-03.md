---
artifact: outline-review-card-validation
part: part-001-build-outline-review-card
created_at: 2026-06-03T14:43:00-04:00
created_by: Codex
---

# Outline Review Card Validation Evidence

## Scope

Implemented the read-only Nova outline review card at:

- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `tests/nova/NovaOutlineDraftCheckpointCard.test.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/index.ts`

The card renders the proposed Arc -> Act -> Chapter -> Scene hierarchy, required scene intent fields, lifecycle labels, source context metadata, schema/version metadata, and optional validation warnings. It remains read-only; accept/reject actions are intentionally left for the next part.

## Acceptance Coverage

- All required hierarchy levels render from a valid checkpoint:
  - `renders all required hierarchy levels from a valid checkpoint`.
- Scene intent fields are visible and readable:
  - `shows scene intent fields and source context metadata`.
- Accepted/rejected lifecycle variants render correctly:
  - `renders accepted and rejected lifecycle variants distinctly`.
- Source-contract tests protect expected copy and actions:
  - `keeps the card read-only and review-gated`.

## Edge Cases

- Large outline with many chapters/scenes:
  - Hierarchy uses native `<details>` sections per arc/act/chapter.
- Long scene intent text:
  - Intent fields use tokenized compact typography and `overflow-wrap: anywhere`.
- Checkpoint payload version is unknown:
  - Version label falls back to `Unknown schema ...`.
- Checkpoint has validation warnings but is still reviewable:
  - Optional `validationWarnings`/`warnings` arrays render when present without blocking the card.

## Verification

- `pnpm test tests/nova/NovaOutlineDraftCheckpointCard.test.ts`
  - Result: pass, 1 file / 4 tests.
- `pnpm check`
  - Result: pass, 0 errors / 11 pre-existing Svelte warnings.
- `pnpm lint`
  - Result: pass.
- `pnpm exec stylelint src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
  - Result: pass.
- `pnpm check:tokens`
  - Result: pass, 347 files / 0 violations.
- `pnpm test tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-state.test.ts tests/nova/NovaOutlineGenerationPanel.test.ts tests/nova/outline-generation-runner.test.ts tests/routes/outline-generation.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/outline-draft-contract.test.ts`
  - Result: pass, 8 files / 52 tests.

## Boundary Scan

Command:

```sh
rg "OpenRouter|apiKey|provider\.complete|better-sqlite3|db\.prepare|rawOutput|updateScene|scene-repository|setProjectMetadata|acceptOutlineCheckpoint|rejectOutlineCheckpoint|upsertOutlineCheckpoint|fetch\(" src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte tests/nova/NovaOutlineDraftCheckpointCard.test.ts
```

Result: only negative source-contract assertions in the test file matched. The card itself does not call providers, access keys, touch DB/project metadata, fetch, mutate manuscript data, or invoke accept/reject/materialization helpers.

## Notes

Full `pnpm lint:css` remains blocked by the pre-existing duplicate `text-align` in `src/modules/world-building/components/IndividualsWorkspaceShell.svelte`; touched Nova files pass targeted stylelint.
