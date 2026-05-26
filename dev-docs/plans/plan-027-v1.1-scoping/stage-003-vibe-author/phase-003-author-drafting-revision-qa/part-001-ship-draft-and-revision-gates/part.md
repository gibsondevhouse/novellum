---
title: Ship Draft and Revision Gates
slug: part-001-ship-draft-and-revision-gates
part_number: 1
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-003-author-drafting-revision-qa
started_at: ~
completed_at: ~
estimated_duration: 4d
---

## Objective

Integrate author-stage scene drafting and revision-pack flows into Nova/editor surfaces with explicit accept controls and release-grade tests.

## Scope

**In scope:**

- Scene draft sidecar rendering and acceptance controls.
- Revision-pack issue rendering and action workflows.
- E2E + integration tests and doc updates.

**Out of scope:**

- Large UI re-theming work.
- New external model integrations.

## Implementation Steps

1. Wire scene draft and revision-pack artifacts into Nova/editor interaction surfaces.
2. Enforce explicit accept/reject behavior before any canonical or manuscript state mutation.
3. Add regression coverage and update pipeline/agent docs.

## Files

**Create:**

- `tests/ai/pipeline/scene-draft-sidecar.test.ts`
- `tests/ai/pipeline/revision-pack.test.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/ai-session-service.svelte.ts`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/editor/components/EditorShell.svelte`
- `src/lib/ai/pipeline/author-agent.ts`
- `dev-docs/03-ai/pipeline.md`
- `dev-docs/03-ai/agents-map.md`

## Acceptance Criteria

- [ ] Scene draft responses include prose + required metadata sidecar fields.
- [ ] Revision pack responses render ranked issues and fix options without auto-apply.
- [ ] E2E tests validate explicit accept/reject behavior in author flows.
- [ ] Documentation reflects shipped contracts and guardrails.

## Edge Cases

- Accepting a revision recommendation must never overwrite manuscript content without user action.
- Draft sidecars with stale IDs must fail with non-destructive user feedback.

## Notes

This part closes plan-027 execution gates and should not be marked review-ready until all quality gates pass.
