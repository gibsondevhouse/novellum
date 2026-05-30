---
title: Enforce Schema Validation
slug: part-001-enforce-schema-validation
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-guardrails
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Ensure all five domain Zod schemas in `worldbuild-schemas.ts` are strict (no `.passthrough()`), and confirm that the generation pipeline validates every model response against its domain schema before storing a checkpoint.

## Scope

**In scope:**

- Audit every schema added in stage-003-phase-001-part-002 for `.passthrough()` calls — remove them
- Confirm the pipeline's schema validation step calls `.parse()` (not `.safeParse().success`) so invalid payloads throw before storage
- Add a `.catch()` handler that logs the validation error and transitions the domain to `failed` state

**Out of scope:**

- Changes to existing pre-stage-034 schemas (governed by separate plans)
- Adding new fields to schemas

## Implementation Steps

1. Read all five domain schemas in `src/lib/ai/pipeline/worldbuild-schemas.ts`.
2. Remove any `.passthrough()` call from domain schemas.
3. Locate where domain proposal payloads are parsed in the pipeline (likely `worldbuild-agent.ts` or `checkpoint-service.ts`).
4. Replace any `safeParse().data` pattern with `.parse()` wrapped in `try/catch` — on catch, transition domain state to `failed`.
5. Run `pnpm check` and `pnpm test`.
6. Capture the schema audit table in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/worldbuild-schemas.ts` (remove `.passthrough()` from domain schemas)
- `src/lib/ai/pipeline/worldbuild-agent.ts` (enforce `.parse()` with error handling)

## Acceptance Criteria

- [ ] Zero `.passthrough()` calls on any of the five domain schemas
- [ ] Invalid model responses throw a schema validation error before storage
- [ ] Validation errors transition the domain to `failed` state
- [ ] `pnpm check` and `pnpm test` pass
- [ ] Schema audit table in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
