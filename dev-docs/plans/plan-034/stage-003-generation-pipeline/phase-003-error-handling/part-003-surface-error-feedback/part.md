---
title: Surface Error Feedback
slug: part-003-surface-error-feedback
part_number: 3
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-003-error-handling
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `WorldbuildingGenerationStatus.svelte` that renders state-aware generation feedback per domain (idle: default, running: spinner, review-ready: proposal badge, missing-context: reason message, failed: error with retry). Wire it into `+page.svelte`.

## Scope

**In scope:**

- `WorldbuildingGenerationStatus` accepts `domainId: WorldbuildingDomainId` prop
- Reads state from the generation state store
- Renders: idle (nothing), running (spinner + "Generating..."), `review-ready` ("Review ready" badge), `missing-context` (reason string), `failed` (error message + Retry button)
- Retry button calls `resetState(domainId)` and re-enables the Generate button
- User-facing error messages must not expose raw errors or stack traces

**Out of scope:**

- `accepted` / `rejected` state display (shown by `WorldbuildingProposalCard`)
- Any new API calls

## Implementation Steps

1. Create `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte`.
2. Import the generation state store; read `getState(domainId)` and `getMissingContextReason(domainId)`.
3. Implement state-conditional rendering using `{#if}` blocks.
4. For `failed`: show generic message + Retry button that calls `resetState(domainId)`.
5. In `+page.svelte`, render `<WorldbuildingGenerationStatus {domainId} />` inside each domain tile.
6. Run `pnpm check`, `pnpm lint:css`, `pnpm check:tokens`.
7. Screenshot of at least two states (running and failed) in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`

## Acceptance Criteria

- [ ] All five state variants render correctly (idle, running, review-ready, missing-context, failed)
- [ ] Failed state shows a user-friendly message with a Retry button
- [ ] Raw errors and stack traces never rendered to the DOM
- [ ] No hardcoded design values (`pnpm check:tokens` passes)
- [ ] Two-state screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
