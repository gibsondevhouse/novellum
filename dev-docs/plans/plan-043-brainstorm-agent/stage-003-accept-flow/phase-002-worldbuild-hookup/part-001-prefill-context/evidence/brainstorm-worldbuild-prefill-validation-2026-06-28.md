# Brainstorm Worldbuild Prefill Validation - 2026-06-28

## Scope

Validated the Stage 003 worldbuilding hookup:

- Accepted Brainstorm seeds open `PreGenerationDialog` for matching entity kinds.
- Seed titles prefill generation targets and submit as `GenerationContextPayload.hints`.
- Brainstorm context notes and `source: "brainstorm"` survive normalization into the generation route.
- Authors can clear brainstorm prefill while keeping unrelated manual targets.

## Commands

```bash
pnpm vitest run tests/nova/brainstorm-staging-store.test.ts tests/nova/brainstorm-proposal-actions.test.ts tests/world-building/brainstorm-prefill-dialog.test.ts tests/world-building/generation-context.test.ts tests/nova/brainstorm-artifact-render.test.ts tests/nova/brainstorm-generation-runner.test.ts --reporter=dot
```

Result: passed, 6 files / 25 tests.

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm check:tokens
```

Result: all passed. `pnpm check` reported 0 errors / 0 warnings; token enforcement scanned 364 files with 0 violations.

## Full Suite Note

```bash
pnpm test
```

Result: failed on unrelated outline source-contract drift:

- `tests/outline/pipeline-scope-header-shell.test.ts:27` expects `Current Layer: {currentLayerLabel}`.
- Current `OutlineSummaryBar.svelte` source contains `Focus: {currentLayerLabel}`.
- `git diff -- src/modules/outline/components/OutlineSummaryBar.svelte tests/outline/pipeline-scope-header-shell.test.ts` is empty in this worktree.

The prefill implementation is covered by the focused Stage 003 suite above; the full-suite blocker is outside this plan slice.
