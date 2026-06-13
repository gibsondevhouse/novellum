# Proposal Flow Tests Evidence - 2026-06-12

## Summary

Validated the diff-aware worldbuilding proposal review flow after the canon merge/diff implementation.

## Coverage

- Create-only proposals still accept through the legacy projection fallback.
- Diff-aware proposals remain review-gated and require explicit accept service/route calls.
- Proposal diff cards render field-level diff, duplicate, and fallback payload details.
- Reject requests include a reason, preserve the reason in proposal metadata, and do not mutate canon.
- Accepted and rejected proposals retain compact audit metadata.

## Validation

- `pnpm vitest run tests/world-building/worldbuilding-proposal-diff-view.test.ts tests/world-building/worldbuilding-proposal-service.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/routes/worldbuilding-proposals.test.ts tests/ai/pipeline/worldbuild-canon-audit.test.ts` - passed, 5 files / 25 tests.
- `pnpm check` - passed, 0 errors / 0 warnings.
- `pnpm exec eslint src/modules/world-building/components/WorldbuildingProposalCard.svelte src/modules/world-building/components/WorldbuildingProposalDiffView.svelte src/modules/world-building/services/worldbuilding-proposal-service.ts 'src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts' 'src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts' src/lib/ai/pipeline/checkpoint-service.ts src/lib/ai/pipeline/worldbuild-proposal-schema.ts tests/world-building/worldbuilding-proposal-diff-view.test.ts tests/world-building/worldbuilding-proposal-service.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/routes/worldbuilding-proposals.test.ts tests/ai/pipeline/worldbuild-canon-audit.test.ts` - passed.
