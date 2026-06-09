---
title: Route Context Inventory
slug: part-001-route-context-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-route-context-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Map active project, scene, and chapter context sources before centralizing them.

## Scope

**In scope:**

- Inspect root layout, project layouts, editor pages, outline pages, and Nova components.
- Record how each route currently derives or omits active context.
- Identify routes where query params are the only context source.

**Out of scope:**

- Implementing new context helpers during the audit.
- Changing route navigation behavior.

## Implementation Steps

1. Trace `activeProjectId`, `activeSceneId`, and `activeChapterId` from layout to Nova components.
2. Inspect editor route load data and URL construction paths.
3. Document each route family with available params/data and Nova needs.
4. Save the inventory under evidence.

## Files

**Create:**

- `evidence/route-context-inventory-evidence-2026-06-09.md`

**Update:**

- None

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

- [ ] Every Nova-mounted route family is listed.
- [ ] Query-param-only context dependencies are identified.
- [ ] Editor scene route context gap is documented.

## Edge Cases

- Root layout can see params but not all child page data.
- Scene and chapter context may be available in editor state but not layout props.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
