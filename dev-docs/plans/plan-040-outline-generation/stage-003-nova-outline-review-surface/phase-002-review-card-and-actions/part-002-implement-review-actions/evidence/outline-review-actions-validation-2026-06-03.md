# Outline Review Actions Validation — 2026-06-03

## Scope

Part 002 wires explicit review actions for outline draft checkpoints while preserving server authority for materialization.

Implemented:

- `src/modules/nova/services/outline-checkpoint-actions.ts`
  - `review` and `reject` call the typed pipeline metadata endpoint.
  - `accept` calls the planned server materialization route: `/api/outline/checkpoints/[checkpointId]/accept`.
  - Route errors are surfaced with status/code/meta through `OutlineCheckpointActionError`.
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
  - Accept requires inline confirmation.
  - Reject requires a non-empty reason.
  - Displayed lifecycle changes only from returned checkpoint payloads.
  - Accept conflict/failure leaves the proposal in pending review.
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
  - Adds action-result lifecycle handling for accepted/rejected checkpoints.
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
  - Passes project/action update context to the card and renders accepted/rejected panel states.
- `src/modules/nova/index.ts`
  - Exports the Nova outline action service.

Deviation:

- The work order only listed the card as an updated UI file. Source inspection showed the panel and outline generation store needed small updates so returned action checkpoints remain the displayed source of truth.
- The Stage 004 materialization route is not implemented yet. The Part 002 action service intentionally targets that route now; tests mock success/conflict behavior and the existing route test continues to prove generic metadata accept is blocked until Stage 004.

## Verification

Focused tests:

```text
pnpm test tests/nova/outline-checkpoint-actions.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-state.test.ts
Result: passed — 3 files / 17 tests
```

Panel regression:

```text
pnpm test tests/nova/NovaOutlineGenerationPanel.test.ts
Result: passed — 1 file / 6 tests
```

Targeted regression bundle:

```text
pnpm test tests/nova/outline-checkpoint-actions.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-state.test.ts tests/nova/NovaOutlineGenerationPanel.test.ts tests/nova/outline-generation-runner.test.ts tests/routes/outline-generation.test.ts tests/routes/outline-checkpoints.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts
Result: passed — 11 files / 72 tests
```

Quality gates:

```text
pnpm check
Result: passed — 0 errors, 11 pre-existing warnings in world-building files

pnpm lint
Result: passed

pnpm lint:css
Result: failed only on pre-existing src/modules/world-building/components/IndividualsWorkspaceShell.svelte duplicate text-align at line 183

pnpm exec stylelint src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte src/modules/nova/components/NovaOutlineGenerationPanel.svelte
Result: passed

pnpm check:tokens
Result: passed — 347 files scanned, 0 violations
```

Browser sanity:

```text
Route: http://localhost:5173/projects/2424d456-319e-4c51-aef2-0c58dea8297e/editor?panel=ai
Observed Nova outline panel text:
OUTLINE / Generate proposal / Ready / 0 characters | 3 plot threads / Generate / Refresh
Result: panel loads after the action wiring changes.
```

Screenshot:

- `outline-review-actions-browser-2026-06-03.png`

## Source Boundary Check

Command:

```text
rg -n "OutlineCheckpointAction|outline-checkpoint-actions|acceptOutlineDraftCheckpointAction|rejectOutlineDraftCheckpointAction|createOutlineCheckpointActions|applyCheckpointActionResult|nova-outline-accept|nova-outline-reject|/api/outline/checkpoints|better-sqlite3|\\$lib/server" src/modules/nova tests/nova -g '!node_modules'
```

Result:

- Component imports only `../services/outline-checkpoint-actions.js` for action entry points.
- The component does not import `$lib/project-metadata`, `$lib/server`, `better-sqlite3`, editor mutation paths, or manuscript update helpers.
- The materialization route string appears only in the Nova action service and tests.
