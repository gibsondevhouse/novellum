---
title: Audit Outline, Worldbuild, and Draft Contracts
slug: part-001-audit-outline-worldbuild-and-draft-contracts
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-discover-existing-contracts
started_at: 2026-06-03T17:00:00Z
completed_at: 2026-06-03T17:16:00Z
estimated_duration: 0.25d
---

## Objective

Map existing source contracts and document the canonical extension points for outline generation.

## Scope

**In scope:**

- Implement only the behavior described in this part.
- Keep changes bounded to the listed files unless source inspection proves a different path is required.
- Add or update tests that directly verify this part's acceptance criteria.
- Record implementation decisions and deviations in `impl.log.md`.

**Out of scope:**

- Broad UI redesign outside the affected Nova/outline surfaces.
- Direct provider SDK calls, client-side API keys, telemetry, sync, or auth.
- Silent manuscript/hierarchy mutation outside the explicit accept path.
- Opportunistic refactors unrelated to this part.

## Implementation Steps

1. Inspect current outline hierarchy stores/services and note required layers, sort keys, and IDs.
2. Inspect worldbuild proposal/checkpoint contracts from plan-037 implementation.
3. Inspect author draft checkpoint contracts from plan-038 implementation.
4. Document extension decision: reuse metadata/pipeline checkpoint pattern unless a blocking schema issue is found.

## Files

**Create:**

- `dev-docs/plans/plan-040-outline-generation/stage-001-outline-contract-and-checkpoint-storage/phase-001-discover-existing-contracts/part-001-audit-outline-worldbuild-and-draft-contracts/evidence/contract-audit-2026-06-03.md`

**Update:**

- `src/modules/outline/index.ts`
- `src/lib/ai/pipeline/index.ts`
- `src/lib/project-metadata.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Evidence file identifies existing source files and recommended extension points.
- [x] No new API surface is proposed without a corresponding existing pattern or explicit justification.
- [x] Audit calls out whether hierarchy layers beyond Arc/Act/Chapter/Scene must be created by adapter defaults.

## Edge Cases

- Plan docs mention a file that has moved or been renamed.
- Existing lint/boundary rules reject the apparent import path.
- Implementation history contradicts current docs; source wins.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
