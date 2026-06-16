# Revision Pack Card Persistence Evidence

Date: 2026-06-15

## Implementation Evidence

- `NovaMessageLog.svelte` loads acknowledgement state for rendered revision-pack artifacts and keeps per-artifact loading/error state.
- `NovaRevisionPackCard.svelte` receives acknowledged issue ids, loading/error props, and an async `onAcknowledge` callback.
- Issue buttons change to `Acknowledged` only after persistence succeeds.
- Failures remain visible and retryable.
- Card copy now states that acknowledgements save review progress only and do not apply manuscript edits.

## Verification

- `tests/nova/nova-revision-pack-card-actions.test.ts` covers persisted disabled buttons, pending save state, success update, and failure retry behavior.
- `tests/nova/nova-artifact-cards.test.ts` covers revision-pack acknowledgement copy and state.
- Final targeted Vitest run: 276 files / 1941 tests passed.

## Review Boundary

This part is ready for Reviewer Agent evaluation. It is not complete until reviewer sign-off is real.
