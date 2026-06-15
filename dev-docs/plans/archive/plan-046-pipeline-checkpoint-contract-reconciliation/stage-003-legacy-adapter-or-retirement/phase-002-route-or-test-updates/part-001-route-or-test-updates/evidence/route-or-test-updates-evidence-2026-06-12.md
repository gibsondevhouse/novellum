# Route or Test Updates Evidence

Date: 2026-06-12
Agent: Codex
Plan: plan-046-pipeline-checkpoint-contract-reconciliation
Stage: stage-003-legacy-adapter-or-retirement
Phase: phase-002-route-or-test-updates
Part: part-001-route-or-test-updates

## Source Updates

- `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`
  - Replaced legacy `family: "vibe-worldbuild"` minimal artifacts with current `pipeline: "vibe-worldbuild"` envelopes.
  - Added `model`, `hierarchy`, `notes`, and named version constants.
- `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`
  - Applied the same current-envelope fixture shape to reject/transition/no-canon tests.
- `src/modules/world-building/services/worldbuilding-proposal-service.ts`
  - `acceptProposal(projectId, proposalId)` now sends `{ projectId }`.
  - `rejectProposal(projectId, proposalId, reason)` now sends `{ projectId, reason }`.
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
  - Accept/reject callbacks now include `proposal.projectId`.
- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
  - Callback prop types now preserve project context.
- `tests/world-building/worldbuilding-proposal-service.test.ts`
  - Added request-body coverage for proposal accept/reject helpers.

## Validation

### Proposal Service Unit Test

Command:

```bash
pnpm vitest run tests/world-building/worldbuilding-proposal-service.test.ts
```

Result:

- 1 test file passed.
- 2 tests passed.

### Chromium E2E

Command:

```bash
pnpm test:e2e -- --project=chromium tests/e2e/hierarchical-pipeline-run-and-review.spec.ts tests/e2e/hierarchical-pipeline-failure-handling.spec.ts
```

Result:

- The package script ran the full Chromium E2E set.
- 19 tests passed.
- No stale checkpoint fixture failures remained.

### Svelte Check

Command:

```bash
pnpm check
```

Result:

- 0 errors.
- 0 warnings.

## Contract Outcome

Supported checkpoint contracts pass with current fixtures. Retired outline
apply behavior remains covered by existing explicit failure tests. No E2E spec
now depends on the malformed Plan-028 worldbuild fixture shape.
