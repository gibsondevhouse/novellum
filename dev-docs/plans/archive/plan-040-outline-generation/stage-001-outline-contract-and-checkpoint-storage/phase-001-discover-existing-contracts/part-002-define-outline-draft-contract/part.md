---
title: Define OutlineDraft Contract
slug: part-002-define-outline-draft-contract
part_number: 2
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-discover-existing-contracts
started_at: 2026-06-03T17:18:00Z
completed_at: 2026-06-03T17:24:00Z
estimated_duration: 0.25d
---

## Objective

Create the typed outline draft schema and validation expectations used by model output, checkpoint persistence, UI review, and materialization.

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

1. Define stable `OutlineDraft` and `OutlineDraftCheckpointRecord` types.
2. Require IDs/slugs/titles/ordering and scene intent fields.
3. Define lifecycle values and audit metadata.
4. Add parser/validator with safe error summaries.
5. Export only through public barrels.

## Files

**Create:**

- `src/lib/ai/pipeline/outline-draft-contract.ts`
- `tests/ai/pipeline/outline-draft-contract.test.ts`

**Update:**

- `src/lib/ai/pipeline/index.ts`
- `dev-docs/03-ai/pipeline.md`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Invalid payloads fail with field-level diagnostics.
- [x] Scene intent fields are mandatory for every generated scene.
- [x] Contract supports source context metadata and schema versioning.
- [x] Tests cover valid, missing-intent, duplicate-id, empty-structure, and unknown-lifecycle cases.

## Edge Cases

- Model returns Markdown instead of JSON.
- Model produces duplicate scene IDs/slugs.
- Outline is valid JSON but empty or too shallow.
- Scene intent contains prose too long for downstream context budget.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
