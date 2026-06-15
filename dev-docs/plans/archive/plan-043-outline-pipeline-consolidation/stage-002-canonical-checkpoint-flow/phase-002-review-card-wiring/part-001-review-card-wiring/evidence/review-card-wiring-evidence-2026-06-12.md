# Review Card Wiring Evidence

Date: 2026-06-12

## Summary

Generated outline proposals render and materialize only through `NovaOutlineDraftCheckpointCard`. The legacy `NovaOutlineCard` remains only as read-only compatibility output for already-open in-memory `author-outline` artifacts.

## Changes

- `src/modules/nova/components/NovaOutlineCard.svelte`
  - Removed the `Apply To Outline` button.
  - Removed `applyAuthorOutlineArtifact()` and `invalidateAll()` dependencies.
  - Replaced apply/error/success state with read-only compatibility copy.
  - Kept JSON preview and copy affordance for historical artifacts.
- `tests/nova/nova-artifact-cards.test.ts`
  - Updated the legacy outline card expectation to assert read-only behavior.
  - Added a source contract that the card no longer references `/api/nova/outline/apply` or `applyAuthorOutlineArtifact`.

## Acceptance Criteria

- The only outline UI that can apply hierarchy changes is the checkpoint card:
  - `NovaOutlineCard` no longer has an apply action.
  - `NovaOutlineDraftCheckpointCard` remains the accept/reject surface.
- Reject and accept actions remain explicit and visible:
  - Existing checkpoint card tests and route tests remain in the targeted regression set.
- Legacy cards cannot trigger hierarchy replacement:
  - The legacy card no longer imports the apply helper and only exposes JSON/copy output.

## Validation

- `pnpm test tests/nova/nova-artifact-cards.test.ts tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts`
  - Result: passed, 4 files / 20 tests.
- `pnpm test tests/nova/nova-artifact-cards.test.ts tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts tests/nova/mode-routing.test.ts tests/nova/chat-service.test.ts tests/nova/outline-generation-state.test.ts`
  - Result: passed, 7 files / 52 tests.
