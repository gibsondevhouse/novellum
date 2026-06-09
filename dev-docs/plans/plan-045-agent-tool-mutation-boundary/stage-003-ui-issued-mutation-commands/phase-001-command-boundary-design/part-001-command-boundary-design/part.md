---
title: Command Boundary Design
slug: part-001-command-boundary-design
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-command-boundary-design
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Separate model-generated review artifacts from explicit author accept/reject commands.

## Scope

**In scope:**

- Define command ownership for author draft, outline, and worldbuilding mutation flows.
- Decide which services remain client callable from UI components.
- Document how model output turns into review cards.

**Out of scope:**

- Implementing broad permission infrastructure.
- Changing server transaction guards.

## Implementation Steps

1. Review existing review card actions and API helpers.
2. Define UI command surfaces and model-callable surfaces.
3. Document how review artifacts are surfaced after generation tools run.
4. Save command boundary design evidence.

## Files

**Create:**

- `evidence/command-boundary-design-evidence-2026-06-09.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Mutation command ownership is explicit by pipeline family.
- [ ] UI buttons remain the accept/reject source of truth.
- [ ] Server-side stale guards remain in place.

## Edge Cases

- Rejecting a checkpoint is still a mutation even if it does not alter manuscript content.
- Worldbuilding proposal accept mutates canon and needs the same boundary.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
