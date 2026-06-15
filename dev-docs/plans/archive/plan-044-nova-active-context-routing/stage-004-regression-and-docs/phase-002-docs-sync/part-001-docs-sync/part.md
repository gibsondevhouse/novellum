---
title: Docs Sync
slug: part-001-docs-sync
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-docs-sync
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Update developer docs so future Nova features use the resolver instead of ad hoc query parsing.

## Scope

**In scope:**

- Update routing/Nova/context docs.
- Mention query override policy.
- Record test commands.

**Out of scope:**

- User-facing tutorial rewrite.
- Plan tracker completion changes.

## Implementation Steps

1. Search docs for query-param context assumptions.
2. Document the resolver/source of truth.
3. Add guidance for new Nova context consumers.
4. Save docs evidence.

## Files

**Create:**

- `evidence/docs-sync-evidence-2026-06-09.md`

**Update:**

- `dev-docs/02-architecture/routing.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

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

- [ ] Docs explain where active Nova context comes from.
- [ ] Query params are documented as optional overrides only.
- [ ] Future feature guidance is clear.

## Edge Cases

- Avoid exposing excessive internal routing detail in user docs.
- Historical docs should remain historical.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
