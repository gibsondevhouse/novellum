# Outline UX States Validation — 2026-06-03

## Scope

Part 003 completes the Nova outline review workflow states with clearer copy, accessible labels, and conflict-blocked presentation.

Implemented:

- `NovaOutlineGenerationPanel.svelte`
  - Empty, loading, blocked, ready, running, failed, cancelled, review-ready, accepted, and rejected states now include next-action copy.
  - Primary, refresh, and abort buttons have explicit `aria-label` values.
  - Status chip uses `role="status"`.
  - Missing prerequisite list has `aria-label="Missing outline prerequisites"`.
- `NovaOutlineDraftCheckpointCard.svelte`
  - Accept/reject/confirm actions have explicit `aria-label` values.
  - 409 accept failures render as `Accept blocked.` with `role="alert"` and do not look like success.
  - Accepted/rejected lifecycle copy states what happened and what to do next.
- `tests/nova/outline-generation-ux-states.test.ts`
  - Covers empty/blocked/ready panel copy, action labels, accepted/rejected panel states, and conflict-blocked accept copy.

## Verification

Focused tests:

```text
pnpm test tests/nova/outline-generation-ux-states.test.ts
Result: passed — 1 file / 3 tests
```

Adjacent UI/action regression:

```text
pnpm test tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/NovaOutlineGenerationPanel.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/nova/outline-generation-state.test.ts
Result: passed — 4 files / 23 tests
```

Targeted regression bundle:

```text
pnpm test tests/nova/outline-generation-ux-states.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-state.test.ts tests/nova/NovaOutlineGenerationPanel.test.ts tests/nova/outline-generation-runner.test.ts tests/routes/outline-generation.test.ts tests/routes/outline-checkpoints.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts
Result: passed — 12 files / 75 tests
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
Settled panel state: ready
Observed copy:
OUTLINE / Generate proposal / Ready / 0 characters | 3 plot threads. Generate creates a review-only checkpoint. / Generate / Refresh
```

Screenshot:

- `outline-ux-states-browser-2026-06-03.png`

## Source Boundary Check

Command:

```text
rg -n "aria-label|role=\"status\"|Accept blocked|Generate creates a review-only checkpoint|Refresh to verify current outline state|better-sqlite3|\\$lib/server|setProjectMetadata|updateScene" src/modules/nova/components/NovaOutlineGenerationPanel.svelte src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte tests/nova/outline-generation-ux-states.test.ts
```

Result:

- Expected state copy and `aria-label`/`role="status"` references are present.
- No `better-sqlite3`, `$lib/server`, `setProjectMetadata`, or `updateScene` matches in the polished Nova components.
