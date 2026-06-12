# Worldbuild & Outline Actions Evidence — 2026-06-11

## Boundary Result

- No model-callable Nova tool reaches outline accept/reject APIs.
- No model-callable Nova tool reaches worldbuilding checkpoint/proposal accept/reject APIs.
- `tests/nova/agent-tool-mutation-boundary.test.ts` now asserts both families remain outside `agent-tools.ts`.

## UI / App Ownership

Outline:

- `NovaOutlineDraftCheckpointCard.svelte` owns visible accept/reject actions through `actions.accept` and `actions.reject`.
- `outline-checkpoint-actions.ts` owns the trusted app command wrapper for outline review, accept, and reject requests.

Worldbuilding:

- `WorldbuildingProposalCard.svelte` exposes `onAccept` and `onReject` callbacks from visible card buttons/forms.
- `world-building-store.svelte.ts` owns staged worldbuild checkpoint accept/reject app actions.

## Validation

- `pnpm check` passed with 0 errors / 0 warnings.
- `pnpm lint` passed.
- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/ai/pipeline/checkpoint-flow.test.ts` passed (5 files / 35 tests).
