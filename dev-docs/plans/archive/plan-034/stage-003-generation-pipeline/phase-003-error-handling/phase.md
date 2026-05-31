---
title: Error Handling
slug: phase-003-error-handling
phase_number: 3
status: draft
owner: Architect Agent
stage: stage-003-generation-pipeline
parts:
  - part-001-implement-state-machine
  - part-002-handle-missing-context
  - part-003-surface-error-feedback
estimated_duration: 1.5d
---

## Goal

Implement the full generation state machine for each domain tile, handle missing-context cases gracefully, and surface actionable error feedback to users without exposing internal details.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement State Machine](part-001-implement-state-machine/part.md) | `draft` | — | 0.5d |
| 002 | [Handle Missing Context](part-002-handle-missing-context/part.md) | `draft` | — | 0.5d |
| 003 | [Surface Error Feedback](part-003-surface-error-feedback/part.md) | `draft` | — | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] State machine covers all defined states: `idle`, `missing-context`, `queued`, `running`, `review-ready`, `accepted`, `rejected`, `failed`
- [ ] State transitions are validated (no illegal jumps, e.g. `running` → `accepted` without `review-ready`)
- [ ] Missing-context state triggers a tooltip/inline message specifying what is absent (no premise, no outline, upstream domain empty)
- [ ] `failed` state shows a user-friendly message (not a raw error or stack trace)
- [ ] `failed` state logs the full error server-side for debugging
- [ ] Generation can be retried from `failed` state
- [ ] State is per-domain (generating Personae does not affect Atlas tile state)
- [ ] `pnpm check`, `pnpm lint`, `pnpm test` pass

## Notes

**Depends on phase-001** (artifact envelopes) and **phase-002** (review-accept) to be meaningful.

State machine reference:

```text
idle → queued → running → review-ready → accepted
                       ↓               ↓
                     failed          rejected
idle → missing-context (no transition until context satisfied)
```

The state machine should be a plain TypeScript Runes module — no external state library required. Each domain tile holds its own independent state instance.

**Key files touched:**

- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts` (new)
- `src/modules/world-building/worldbuilding-readiness.ts` (updated)
- `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte` (new)
- `src/routes/projects/[id]/world-building/+page.svelte` (updated)
