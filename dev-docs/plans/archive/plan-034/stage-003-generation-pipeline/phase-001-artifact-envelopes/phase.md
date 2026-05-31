---
title: Artifact Envelopes
slug: phase-001-artifact-envelopes
phase_number: 1
status: draft
owner: Backend Agent
stage: stage-003-generation-pipeline
parts:
  - part-001-define-domain-proposal-kinds
  - part-002-create-artifact-schema
  - part-003-wire-checkpoint-storage
estimated_duration: 2d
---

## Goal

Define domain-scoped artifact proposal kinds for each worldbuilding domain, create schema-validated output shapes, and wire these into the existing checkpoint storage system.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Define Domain Proposal Kinds](part-001-define-domain-proposal-kinds/part.md) | `draft` | — | 0.5d |
| 002 | [Create Artifact Schema](part-002-create-artifact-schema/part.md) | `draft` | — | 0.75d |
| 003 | [Wire Checkpoint Storage](part-003-wire-checkpoint-storage/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Five domain task keys added to `src/lib/ai/pipeline/task-catalog.ts`: `WORLDBUILD_DOMAIN_PERSONAE`, `WORLDBUILD_DOMAIN_ATLAS`, `WORLDBUILD_DOMAIN_ARCHIVE`, `WORLDBUILD_DOMAIN_THREADS`, `WORLDBUILD_DOMAIN_CHRONICLES`
- [ ] Five domain Zod schemas in `src/lib/ai/pipeline/worldbuild-schemas.ts` with `.strict()` validation (no `.passthrough()`)
- [ ] `createDomainCheckpoint()` in `src/lib/ai/pipeline/checkpoint-service.ts` stores proposals with `lifecycle: 'draft'`
- [ ] Proposals are staged — no canon writes on creation
- [ ] Each domain checkpoint record captures: `taskKey`, `lifecycle`, `artifact.payload`, `createdAt`
- [ ] `pnpm check` and `pnpm test` pass

## Notes

**Depends on stage-001-phase-002** (domain taxonomy) for canonical domain IDs.

The existing `populated-world-bible` checkpoint type is the model to extend from, not replace. New domain-scoped kinds are additive.

Schema by domain (minimum required fields):

| Domain | Required output fields |
| --- | --- |
| `worldbuild.personae` | individuals, factions, relationships |
| `worldbuild.atlas` | realms, landmarks, travel constraints |
| `worldbuild.archive` | myths, traditions, technology systems |
| `worldbuild.threads` | major arcs, subplots, motivations |
| `worldbuild.chronicles` | eras, key events, personal histories |
