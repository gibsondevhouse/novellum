---
title: Define Domain Proposal Kinds
slug: part-001-define-domain-proposal-kinds
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-artifact-envelopes
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add five domain-scoped task keys to `PIPELINE_TASK_KEYS` in `task-catalog.ts` and a `WORLDBUILD_DOMAIN_PIPELINE_KEYS` array in `worldbuild-agent.ts`, using the `vibe-worldbuild.domain.*` key namespace.

## Scope

**In scope:**

- Five new keys: `WORLDBUILD_DOMAIN_PERSONAE`, `WORLDBUILD_DOMAIN_ATLAS`, `WORLDBUILD_DOMAIN_ARCHIVE`, `WORLDBUILD_DOMAIN_THREADS`, `WORLDBUILD_DOMAIN_CHRONICLES`
- Each key maps to a `PipelineTaskDefinition` entry in `PIPELINE_TASK_CATALOG` (family, stage, target, contextPolicy, outputFormat, role)
- Export `WORLDBUILD_DOMAIN_PIPELINE_KEYS` array from `worldbuild-agent.ts`
- Update `WorldbuildTaskKey` type to include the new keys

**Out of scope:**

- Zod schemas for domain outputs (part-002)
- Checkpoint storage wiring (part-003)

## Implementation Steps

1. Open `src/lib/ai/pipeline/task-catalog.ts`.
2. Add five new entries to `PIPELINE_TASK_KEYS` with pattern `vibe-worldbuild.domain.personae` etc.
3. Add matching entries to `PIPELINE_TASK_CATALOG` — for `outputFormat`, use placeholder domain-specific keys (e.g. `json_worldbuild_domain_personae`) to be backed by schemas in part-002.
4. Open `src/lib/ai/pipeline/worldbuild-agent.ts`; extend `WORLDBUILD_PIPELINE_KEYS` with the new keys.
5. Update `WorldbuildTaskKey` type.
6. Run `pnpm check`.
7. Save tsc output to `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/task-catalog.ts`
- `src/lib/ai/pipeline/worldbuild-agent.ts`

## Acceptance Criteria

- [ ] Five new task keys in `PIPELINE_TASK_KEYS` with correct string values
- [ ] Five matching entries in `PIPELINE_TASK_CATALOG`
- [ ] `WorldbuildTaskKey` type updated to include all new keys
- [ ] `pnpm check` passes
- [ ] tsc output in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
