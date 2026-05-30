---
title: Document Generation Workflow
slug: part-003-document-generation-workflow
part_number: 3
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-testing-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `dev-docs/03-ai/worldbuild-generation.md` documenting the domain generation architecture, how to add new domains, how to extend prompt seeds, and how to troubleshoot generation failures.

## Scope

**In scope:**

- Architecture overview: pipeline flow from Generate button → Nova prefill → checkpoint storage → review → accept → canon projection
- Domain taxonomy table: each domain, its `targetEntities`, `dependencyIds`, `promptSeedKey`
- Adding a new domain: step-by-step checklist (workflow.ts, task-catalog.ts, schemas, seeds, projection)
- Extending prompt seeds: structure of a seed, constraints format, outputFormat keys
- Troubleshooting section: schema validation failures, missing-context, canon projection atomicity failures

**Out of scope:**

- Documenting unrelated pipeline features (author pipeline etc.)
- User-facing documentation (that belongs in `novellum-docs/`)

## Implementation Steps

1. Create `dev-docs/03-ai/worldbuild-generation.md`.
2. Write architecture section with a Mermaid flow diagram showing the generation pipeline.
3. Write domain taxonomy table from `WORLDBUILDING_DOMAIN_SEQUENCE` data.
4. Write "Adding a New Domain" checklist referencing real file paths from plan-034.
5. Write troubleshooting section with the three most likely failure modes.
6. Verify no markdownlint errors.
7. Confirm lint-clean output in `evidence/`.

## Files

**Create:**

- `dev-docs/03-ai/worldbuild-generation.md`

**Update:**

- None

## Acceptance Criteria

- [ ] Architecture overview and Mermaid diagram present
- [ ] Domain taxonomy table covers all five domains with `targetEntities`, `dependencyIds`, `promptSeedKey`
- [ ] "Adding a New Domain" checklist references real file paths from plan-034
- [ ] Troubleshooting section covers schema validation, missing-context, and projection failures
- [ ] No markdownlint errors
- [ ] Lint-clean evidence in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
