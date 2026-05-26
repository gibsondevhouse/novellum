---
title: ApiSettings UI
slug: part-002-api-settings-ui
part_number: 2
status: complete
owner: stylist
assigned_to: stylist
phase: phase-004-settings-ai-key-flow
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Refactor `ApiSettings.svelte` to operate exclusively against the new credential service, render a masked status, and clear the input on submission.

## Scope

**In scope:**

- Replace any `localStorage` access in `ApiSettings.svelte` with `credentialService.getStatus`, `saveKey`, `deleteKey`, `testKey`.
- UI states: `unconfigured`, `configured` (showing `maskedHint` + `lastVerifiedAt`), `saving`, `testing`, `error`.
- The save button must be `type="submit"` inside a `<form>` for keyboard accessibility; the input must clear after a successful save and never reflect the previous value.
- A "Remove key" button in the configured state.
- A "Test connection" button that disables itself while pending.

**Out of scope:**

- Routes — phase-004 part-001.
- Model selection — phase-005.

## Implementation Steps

1. Rewrite the component with Svelte 5 Runes (`$state`, `$derived`).
2. Use `credentialService` exclusively; the component must not import anything under `$lib/legacy/dexie`.
3. Snapshot the masked-status payload in a Vitest test.
4. Visual smoke: confirm focus order, ESC behaviour, and that the input is `autocomplete="off"` and `spellcheck="false"`.

## Files

**Update:**

- `src/modules/settings/components/ApiSettings.svelte`

**Create:**

- `tests/settings/api-settings.test.ts`

## Acceptance Criteria

- [ ] No `localStorage` reads/writes remain in the component.
- [ ] Input clears on save; saved key is never re-rendered.
- [ ] Masked hint and `lastVerifiedAt` render after a successful save.
- [ ] Component test covers configured / unconfigured / save / delete / test transitions.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Network failure during save: surface a non-blocking error toast, leave the input value intact so the user can retry without retyping.
- Test action with no stored key and an empty input: disabled.

## Notes

- Coordinate with the design system — the masked status component should reuse existing chip/badge primitives.
