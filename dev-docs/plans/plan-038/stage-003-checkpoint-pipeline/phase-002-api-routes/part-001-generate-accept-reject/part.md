---
title: Generate / Accept / Reject Routes
slug: part-001-generate-accept-reject
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-api-routes
started_at: 2026-06-01
completed_at: 2026-06-01
estimated_duration: 1d
---

## Objective

Implement SvelteKit API route handlers for the full author-draft checkpoint HTTP surface,
plus client wrappers.

## Scope

**Created:**

- `src/routes/api/author-draft/checkpoints/+server.ts` (list)
- `src/routes/api/author-draft/checkpoints/generate/+server.ts` (generate with repair loop)
- `src/routes/api/author-draft/checkpoints/accept/+server.ts`
- `src/routes/api/author-draft/checkpoints/reject/+server.ts`
- `src/routes/api/db/author-draft/scene-draft-context/+server.ts`
- `src/modules/nova/services/author-draft-api.ts`

## Acceptance Criteria

- [x] All routes implement proper HTTP verbs and status codes.
- [x] Generate route: 2-attempt repair loop for parse failures.
- [x] `persistGenerationFailure` saves a `rejected` checkpoint on unrecoverable error.
- [x] All routes guarded by project ownership / auth.
- [x] Client wrappers cover all routes.

## Known Gap

`rawOutput` (raw LLM response text) is returned in the generate response body. This is
wasteful and a prompt-injection surface. Removal tracked in stage-005, part-002.
