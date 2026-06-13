# Artifact Card Retirement Evidence

Date: 2026-06-12

## Summary

The legacy outline artifact card no longer exposes hierarchy mutation behavior and is no longer exported through the Nova public barrel.

## Changes

- `src/modules/nova/components/NovaOutlineCard.svelte`
  - Converted to read-only compatibility display.
  - Removed the direct apply button, apply state, and route helper dependency.
- `src/modules/nova/index.ts`
  - Removed the public `NovaOutlineCard` export.
  - Kept `NovaOutlineDraftCheckpointCard` public as the canonical review card.
- `src/modules/nova/components/NovaMessageLog.svelte`
  - Still supports old in-memory `author-outline` messages by rendering the now-read-only card.
- `tests/nova/nova-artifact-cards.test.ts`
  - Asserts no visible `Apply To Outline` button.
  - Asserts the public Nova barrel does not export the legacy card.

## Acceptance Criteria

- No visible legacy outline card button can apply hierarchy changes:
  - Covered by component text/source tests.
- Supported outline checkpoint cards still work:
  - Checkpoint action and e2e tests remain in the final regression set.
- Exports do not expose retired mutation helpers unnecessarily:
  - `NovaOutlineCard` was removed from `src/modules/nova/index.ts`.

## Validation

- `pnpm test tests/nova/nova-artifact-cards.test.ts`
  - Result: passed as part of the targeted route/card runs.
