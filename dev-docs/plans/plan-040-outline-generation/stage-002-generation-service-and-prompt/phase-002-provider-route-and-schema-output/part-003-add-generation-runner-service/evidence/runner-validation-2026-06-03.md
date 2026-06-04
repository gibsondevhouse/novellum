---
artifact: runner-validation
part: part-003-add-generation-runner-service
created_at: 2026-06-03T14:17:00-04:00
created_by: Codex
---

# Runner Validation Evidence

## Scope

Implemented the Nova outline generation runner at:

- `src/modules/nova/services/outline-generation-runner.ts`
- `tests/nova/outline-generation-runner.test.ts`
- `src/modules/nova/index.ts`

The runner wraps `POST /api/ai/outline/generate`, tracks `idle`, `ready`, `running`, `succeeded`, `failed`, and `cancelled` states, blocks duplicate active runs, supports internal and external abort signals, exposes `retry()`, and normalizes route failures into UI-safe typed results.

## Acceptance Coverage

- Duplicate active run: covered by `blocks duplicate active runs without starting a second request`.
- Cancellation distinct from failure: covered by `reports cancellation distinctly from failure`.
- Checkpoint ID and review payload on success: covered by `returns checkpoint id and review payload on success`.
- Provider error: covered by `normalizes provider errors into failed runner state`.
- Retry behavior: covered by `can prepare and retry the last request`.
- Validation error: covered by `keeps schema validation failures as typed failure issues`.

## Edge Cases

- Network error before response body: covered by `fails safely for network errors before a response body exists`.
- Malformed JSON response: covered by `fails safely when the response body is malformed JSON`.
- Fast double-click: covered by the duplicate active run test.

## Verification

- `pnpm test tests/nova/outline-generation-runner.test.ts`
  - Result: pass, 1 file / 8 tests.
- `pnpm check`
  - Result: pass, 0 errors / 11 pre-existing Svelte warnings.
- `pnpm lint`
  - Result: pass.
- `pnpm test tests/nova/outline-generation-runner.test.ts tests/routes/outline-generation.test.ts tests/ai/pipeline/outline-generation-prompt.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/context-hierarchy-mapping.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts`
  - Result: pass, 8 files / 57 tests.

## Boundary Scan

Command:

```sh
rg "OpenRouter|apiKey|provider\.complete|db\.prepare|project_metadata|rawOutput|manuscript|hierarchy" src/modules/nova/services/outline-generation-runner.ts tests/nova/outline-generation-runner.test.ts
```

Result: no matches. The runner does not call providers directly, access API keys, touch DB/project metadata, expose raw provider output, mutate manuscript content, or materialize hierarchy rows.

## Notes

No UI or style files changed in this part, so `pnpm lint:css` and `pnpm check:tokens` were not applicable.
