---
title: Context-Priority Worldbuilding Generation
slug: plan-036-context-priority-generation
version: 1.0.0
status: review
owner: Planner Agent
created: 2026-05-30
last_updated: 2026-05-31
target_completion: 2026-06-06
stages:
  - stage-001-character-context-priority
  - stage-002-faction-lineage-extension
  - stage-003-verification-and-docs
dependencies:
  - plan-032-worldbuilding-generation-engine
  - plan-035-fix-json-double-encoding
quality_gates:
  - lint
  - typecheck
  - tests
  - tokens
  - docs_sync
  - manual_verify
---

## Objective

Make worldbuilding generation context-aware at the entity-name level and ensure generated Character drafts can fully populate the existing character dossier fields already supported by SQLite and `/api/db/characters`.

This plan introduces explicit target-vs-avoid name guidance before generation, threads that context through client and server contracts, expands character generation schema/prompting to include psychological and voice fields, and then extends the same context-priority model to Factions and Lineages.

## Scope

**In scope:**

- Add a typed generation-context contract (instead of string-only context) across GenerateButton -> store -> service -> `/api/worldbuilding/generate`.
- Add deterministic candidate-name extraction from project title/synopsis with user override controls before generation.
- Expand Character generation schema/prompt output to include currently unfilled DB fields:
  - `coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, `speechPattern`.
- Map expanded Character draft fields into `GeneratedEntityModal.saveDraft` so `/api/db/characters` receives populated values.
- Extend context-priority rules to Faction and Lineage generation prompts while preserving existing persistence contracts.
- Add validator/hardening logic to reduce malformed draft acceptance.
- Add targeted tests and doc updates.

**Out of scope:**

- Auto-applying generated drafts without user review.
- Database schema migration for factions/lineages beyond current storage contracts.
- Replacing the `vibe-worldbuild` checkpoint pipeline or task catalog.
- Redesigning worldbuilding workspace IA/layout outside generation flow touchpoints.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Character Context Priority](stage-001-character-context-priority/stage.md) | `review` | 2.5d |
| 002 | [Faction + Lineage Extension](stage-002-faction-lineage-extension/stage.md) | `review` | 1.5d |
| 003 | [Verification + Docs](stage-003-verification-and-docs/stage.md) | `review` | 1d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** — zero lint errors (`pnpm lint`, `pnpm lint:css`)
- [~] **typecheck** — one pre-existing error only (`DomainCounts` in +page.svelte, unrelated to this plan)
- [x] **tests** — 203 files / 1472 tests pass
- [x] **tokens** — 335 files / 0 violations
- [x] **docs_sync** — `dev-docs/03-ai/worldbuild-generation.md` and `CHANGELOG.md` updated
- [x] **manual_verify** — dialog, context flow, and save path smoke-tested in mock mode

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Prompt expansion increases malformed JSON risk | medium | Add explicit output schema constraints plus server-side draft validator before returning drafts |
| Name extraction yields false positives | medium | Keep extraction heuristic deterministic and user-editable via pre-generation dialog |
| Merge conflicts with active plan-035 touchpoints | medium | Land plan-035 first or rebase carefully; keep changes scoped to generation files |
| Context-priority UX confuses users | low | Use explicit target/avoid labels and preserve safe defaults (all neutral) |

## Notes

Current code already supports most advanced Character fields in DB/API (`coreDesire`, `fear`, `contradiction`, etc.), but worldbuilding generation currently does not request or persist them. This plan closes that gap without changing canonical write safety: generated output remains review-first and author-approved.
