---
title: Add Generation Context Contract
slug: part-001-add-generation-context-contract
part_number: 1
status: in-progress
owner: Planner Agent
assigned_to: Backend Agent
phase: phase-001-context-contract-and-prompt
started_at: 2026-05-31
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Introduce a typed `generationContext` payload that can represent named-candidate decisions (target vs avoid vs neutral) and thread it across client and server generation boundaries.

## Scope

**In scope:**

- Define shared types for generation context payload.
- Update generation service/store method signatures to accept typed context.
- Update route request interface and parsing to accept typed context.
- Maintain compatibility with existing `context?: string` usage during transition.

**Out of scope:**

- UI for collecting context (handled in Stage 001 Phase 002).
- Prompt behavior changes (handled in part-002).

## Implementation Steps

1. Add a shared type module for generation context and candidate intent.
2. Update `generateWorldbuildingEntities()` params and request body shape.
3. Update `startGeneration()` to pass structured context.
4. Update `/api/worldbuilding/generate` request body type and input guards.
5. Add temporary fallback mapping from string context -> typed context note.

## Files

**Create:**

- `src/modules/world-building/services/generation-context.ts`

**Update:**

- `src/modules/world-building/services/worldbuilding-generation-service.ts`
- `src/modules/world-building/stores/generation-draft.svelte.ts`
- `src/routes/api/worldbuilding/generate/+server.ts`

## Acceptance Criteria

- [x] `generationContext` type is exported and reused by service/store/route
- [x] Service request body includes typed context object
- [x] Route accepts structured context without runtime type errors
- [x] Legacy string context path remains non-breaking until UI migration is complete

## Edge Cases

- Missing or partial context payloads must degrade to neutral generation behavior.

## Notes

Keep this contract intentionally minimal and deterministic to avoid coupling UI state internals to the API surface.
