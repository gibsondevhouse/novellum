# Brainstorm Accept Flow Validation - 2026-06-28

## Scope

Validated the Stage 003 review/accept implementation:

- Ephemeral `brainstormStaging` store accepts, removes, rejects, restores, and clears proposals.
- Proposal cards expose accept/remove/reject controls and decision state.
- Brainstorm sessions show staged counts and clear controls.
- Store maps staged seeds to worldbuilding entity kinds for the following hookup phase.

## Commands

```bash
pnpm exec prettier --check src/lib/stores/brainstorm-staging.store.svelte.ts src/modules/nova/components/brainstorm/BrainstormSession.svelte src/modules/nova/components/brainstorm/ProposalCard.svelte src/modules/nova/components/brainstorm/ProposalList.svelte src/modules/world-building/components/GenerateButton.svelte src/modules/world-building/components/PreGenerationDialog.svelte src/modules/world-building/services/generation-context.ts src/routes/api/worldbuilding/generate/+server.ts tests/nova/brainstorm-proposal-actions.test.ts tests/nova/brainstorm-staging-store.test.ts tests/world-building/brainstorm-prefill-dialog.test.ts tests/world-building/generation-context.test.ts
```

Result: passed. All matched files use Prettier code style.

```bash
pnpm exec eslint src/lib/stores/brainstorm-staging.store.svelte.ts src/modules/nova/components/brainstorm/BrainstormSession.svelte src/modules/nova/components/brainstorm/ProposalCard.svelte src/modules/nova/components/brainstorm/ProposalList.svelte src/modules/world-building/components/GenerateButton.svelte src/modules/world-building/components/PreGenerationDialog.svelte src/modules/world-building/services/generation-context.ts src/routes/api/worldbuilding/generate/+server.ts tests/nova/brainstorm-proposal-actions.test.ts tests/nova/brainstorm-staging-store.test.ts tests/world-building/brainstorm-prefill-dialog.test.ts tests/world-building/generation-context.test.ts
```

Result: passed.

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

The accept-flow implementation is covered by the focused Stage 003 suite above; the full-suite blocker is outside this plan slice.
