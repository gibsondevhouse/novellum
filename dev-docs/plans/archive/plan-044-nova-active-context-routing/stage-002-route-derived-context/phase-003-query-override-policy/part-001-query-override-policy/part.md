---
title: Query Override Policy
slug: part-001-query-override-policy
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-query-override-policy
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Define and implement when `sceneId` and `chapterId` query params override route-derived context.

## Scope

**In scope:**

- Support intentional deep links where product flow needs them.
- Prevent query params from masking invalid project/scene relationships.
- Add tests for override precedence and invalid overrides.

**Out of scope:**

- Removing all query-param support.
- Adding new deep-link formats.

## Implementation Steps

1. Add query override handling to the resolver if not already present.
2. Validate override fields against available route/page data where possible.
3. Add tests for valid, missing, and conflicting query params.
4. Document policy in evidence.

## Files

**Create:**

- `evidence/query-override-policy-evidence-2026-06-09.md`

**Update:**

- `src/modules/nova/services/active-context.ts`
- `tests/nova/active-context.test.ts`

**Reference:**

- `src/routes/+layout.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/services/chat-service.ts`
- `dev-docs/02-architecture/routing.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Query params are optional overrides, not required defaults.
- [ ] Invalid/conflicting overrides do not silently corrupt context.
- [ ] Deep-link behavior is documented.

## Edge Cases

- Route-level validation may not have enough DB data client-side.
- Overly strict validation can break existing bookmark links.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
