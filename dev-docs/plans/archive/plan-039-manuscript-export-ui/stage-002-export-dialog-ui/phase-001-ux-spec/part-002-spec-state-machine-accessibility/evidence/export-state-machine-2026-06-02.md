# Export State Machine and Accessibility — 2026-06-02

Implemented states:

- `idle`
- `validating`
- `exporting`
- `delivery-pending`
- `delivered`
- `cancelled`
- `failed`

Transitions:

- `idle` -> `validating` on primary action.
- `validating` -> `idle` on validation failure.
- `validating` -> `exporting` when request is valid.
- `exporting` -> `delivery-pending` when service returns blob/filename.
- `delivery-pending` -> `delivered` for browser download or desktop save.
- `delivery-pending` -> `cancelled` for user cancellation.
- Any generation/delivery exception -> `failed`.
- `failed` -> `validating` through Retry.

Accessibility:

- Dialog uses `role="dialog"`, `aria-modal="true"`, and `aria-label="Export manuscript"`.
- Validation and failure messages use `role="alert"`.
- Loading, selection, warning, success, and cancellation messages use `role="status"`.
- Escape closes the dialog only when no unsafe operation is in progress.
- Controls are native inputs/selects/buttons with visible labels.
