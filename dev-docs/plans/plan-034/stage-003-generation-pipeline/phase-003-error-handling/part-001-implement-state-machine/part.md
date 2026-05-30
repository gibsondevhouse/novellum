---
title: Implement State Machine
slug: part-001-implement-state-machine
part_number: 1
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-003-error-handling
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts` — a per-domain Svelte 5 Runes state store covering all 8 generation states with validated transition helpers.

## Scope

**In scope:**

- `WorldbuildingGenerationStateValue` union: `'idle' | 'missing-context' | 'queued' | 'running' | 'review-ready' | 'accepted' | 'rejected' | 'failed'`
- A per-domain state map (`Record<WorldbuildingDomainId, WorldbuildingGenerationStateValue>`)
- `transition(domainId, newState)` helper that validates legal transitions and throws on illegal ones
- `getState(domainId)`, `resetState(domainId)` exports
- Use `$state` rune only (Svelte 5 — no `writable()` store)

**Out of scope:**

- `missing-context` integration (part-002)
- UI components (part-003)

## Implementation Steps

1. Study `src/modules/world-building/stores/generation-draft.svelte.ts` as the state machine pattern to follow.
2. Create `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`.
3. Define `LEGAL_TRANSITIONS: Record<WorldbuildingGenerationStateValue, WorldbuildingGenerationStateValue[]>` for validation.
4. Implement per-domain `$state` map initialized with all five domains as `'idle'`.
5. Implement `transition`, `getState`, `resetState`.
6. Run `pnpm check`.
7. Save the transition table as a code artifact in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] All 8 states defined in the union type
- [ ] `LEGAL_TRANSITIONS` covers all defined valid transitions
- [ ] `transition()` throws a descriptive error for illegal jumps (e.g. `running` → `accepted`)
- [ ] No Svelte 4 reactivity (`writable`, `$:`) — Runes only
- [ ] `pnpm check` passes
- [ ] Transition table in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
