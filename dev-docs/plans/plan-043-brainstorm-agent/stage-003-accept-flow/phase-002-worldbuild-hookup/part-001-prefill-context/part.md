---
title: Prefill Context
slug: part-001-prefill-context
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-worldbuild-hookup
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Integrate accepted brainstorm seeds into the worldbuilding entity creation flow so that
seeds prefill generation context and draft fields.

## Scope

**In scope:**

- Read accepted seeds from brainstorm staging store
- Inject seeds into worldbuild context engine
- Prefill entity creation forms (character, faction, realm, etc.)
- Show prefill source and allow clearing
- E2E test: brainstorm → accept → create entity with prefilled context

**Out of scope:**

- Automatic entity creation (manual trigger only)
- Seed persistence to database (staging store is ephemeral)

## Implementation Steps

1. Import brainstorm staging store in worldbuild module
2. When opening entity creation form, check for accepted seeds
3. Transform seeds into context objects matching the entity type
4. Inject context into `ContextEngine` or prefill form fields
5. Show visual indicator that context came from brainstorm
6. Allow author to clear prefill and start fresh
7. Test end-to-end:
   - Generate brainstorm seeds
   - Accept a character seed
   - Open character creation form
   - Verify seed data prefills form
   - Generate entity with prefilled context

## Files

**Update:**

- Worldbuilding entity creation form component
- Context engine or entity generation handler
- Possibly `src/lib/stores/` to export brainstorm store

## Acceptance Criteria

- [ ] Brainstorm staging store read in worldbuild module
- [ ] Accepted seeds transform to context format
- [ ] Entity forms prefill with seed data
- [ ] Prefill source indicated to author
- [ ] Author can clear prefill
- [ ] E2E flow works: brainstorm → accept → form prefill → generate
- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm test` passes

## Edge Cases

- No accepted seeds (forms should work normally)
- Multiple accepted seeds of same type (pick first or let author choose)
- Prefilled form edited by author (changes persist)
- Entity generation from prefilled context succeeds

## Notes

This is the final integration piece that closes the Brainstorm → Worldbuild loop. It should
feel natural to authors: generate ideas, accept ones you like, and let them guide entity creation.
