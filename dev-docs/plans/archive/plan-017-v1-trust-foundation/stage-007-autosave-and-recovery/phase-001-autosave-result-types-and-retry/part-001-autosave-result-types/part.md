---
title: Autosave Result Types
slug: part-001-autosave-result-types
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-001-autosave-result-types-and-retry
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Introduce the `AutosaveResult` shape and migrate `autosave-service.ts`
to a single typed subscriber. No retry behaviour yet — that lands in
part-002.

## Files

**Modify:**

- `src/modules/editor/services/autosave-service.ts`

**Create:**

- `src/modules/editor/services/autosave-types.ts`
- `tests/editor/autosave-result.test.ts`

## Shape

```ts
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export interface AutosaveResult {
    status: AutosaveStatus;
    savedAt: string | null; // ISO; null when never saved or pending
    error: string | null; // sanitised message; never includes secrets
    pendingDraft: string | null; // retained text when status === 'failed'
    attempt: number; // 0 for non-failed, >=1 while retrying
}
```

## Acceptance Criteria

- [x] Subscriber callback receives `AutosaveResult`, not a status string.
- [x] `mount()` emits an initial `idle` result.
- [x] `flushNow()` resolves only after the result has been emitted.
- [x] Test verifies the emitted sequence on a successful save:
      `idle → saving → saved`.
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.
