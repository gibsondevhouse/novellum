# Message Log Scene Draft Actions Evidence

Date: 2026-06-15

## Implementation Evidence

- `NovaMessageLog.svelte` now passes durable `onAccept`, `onConfirmAccept`, and `onReject` handlers into `NovaSceneDraftCard.svelte`.
- `NovaSceneDraftCard.svelte` no longer claims local acceptance. Accept saves for review, then displays `Confirm apply`; stale targets offer explicit retry/overwrite handling.
- Confirmed apply uses the existing author-draft accept route and dispatches `dispatchSceneContentApplied()` only after the server returns the accepted checkpoint and refreshed scene content.
- Missing handlers and insufficient context render blocked copy instead of pretending an edit landed.

## Verification

- `tests/nova/nova-scene-draft-card-actions.test.ts` covers pending save, blocked handler absence, and message-log source wiring.
- `tests/nova/nova-artifact-cards.test.ts` verifies inline scene-draft save before confirm apply.
- Final targeted Vitest run: 276 files / 1941 tests passed.
- Targeted Playwright review-gate run: 3 chromium tests passed.

## Review Boundary

This part is ready for Reviewer Agent evaluation. It is not complete until reviewer sign-off is real.
