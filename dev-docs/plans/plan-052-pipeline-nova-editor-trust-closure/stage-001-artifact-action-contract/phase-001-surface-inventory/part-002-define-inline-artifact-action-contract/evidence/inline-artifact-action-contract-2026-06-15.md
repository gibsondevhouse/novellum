# Inline Artifact Action Contract Evidence

Date: 2026-06-15
Part: `part-002-define-inline-artifact-action-contract`

## Implemented Contract

- Added `src/modules/nova/services/artifact-action-types.ts`.
- Exported the contract through `src/modules/nova/index.ts` so consumers can avoid deep imports across module boundaries.
- Added `tests/nova/artifact-action-types.test.ts` for classification, durable-write requirements, fallback states, target creation, and serializable audit metadata.

## Contract Decisions

- Review decisions are distinct from non-mutating acknowledgements:
  - `review_decision`: Accept/Reject-style actions that may transition a review artifact or lead to explicit manuscript mutation after server checks.
  - `non_mutating_acknowledgement`: Revision-pack review notes that must persist but must not touch manuscript/canon content.
  - `local_utility`: Copy actions that remain browser-local and do not require durable persistence.
- Action status is explicit and user-safe: `succeeded`, `failed`, `insufficient_context`, `stale_target`, and cancellation/running states can be rendered without leaking provider or stack details.
- Durable writes are opt-in by classification via `actionRequiresDurableWrite()`.
- Fallback behavior is represented by helper constructors:
  - `createInsufficientContextResult()` for legacy or untargeted artifacts.
  - `createStaleTargetResult()` for stale scene/checkpoint targets.
- Controller audit metadata is serializable and optional. The contract does not import server controller modules or depend on plan-051 being marked complete.

## Verification

- Added focused unit coverage in `tests/nova/artifact-action-types.test.ts`.
- Runtime behavior is not wired in this part; stage 002 will consume this contract for scene draft bridge and revision acknowledgement persistence.
