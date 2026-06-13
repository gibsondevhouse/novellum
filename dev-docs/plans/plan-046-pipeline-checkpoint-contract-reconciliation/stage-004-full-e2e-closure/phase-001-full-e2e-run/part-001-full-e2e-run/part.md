---
title: Full E2E Run
slug: part-001-full-e2e-run
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-full-e2e-run
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Prove route/test reconciliation restores the full e2e baseline.

## Scope

**In scope:**

- Full `pnpm test:e2e --project=chromium` run.
- Failure triage if any failures remain.
- Command output evidence.

**Out of scope:**

- Visual regression suite unless e2e changes affect layout.
- Skipping failing specs without classification.

## Implementation Steps

1. Run the full Chromium e2e suite with the repo package command.
2. If it fails, classify each remaining failure before changing code.
3. Save final pass output or triage notes under evidence.
4. Update closeout notes.

## Files

**Create:**

- `evidence/full-e2e-run-evidence-2026-06-12.md`

**Update:**

- None

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [x] Full Chromium e2e suite passes or every remaining failure is a documented blocker.
- [x] No stale checkpoint fixture failures remain.
- [x] Evidence includes exact command and result.

## Edge Cases

- Package script may run all e2e even when specs are appended.
- Playwright server logs may contain noisy color warnings.

## Notes

`pnpm test:e2e --project=chromium` passed 19/19 tests after the fixture reconciliation.
