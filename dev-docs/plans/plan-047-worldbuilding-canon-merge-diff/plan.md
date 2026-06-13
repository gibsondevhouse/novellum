---
title: Worldbuilding Canon Merge Diff
slug: plan-047-worldbuilding-canon-merge-diff
version: 1.0.0
status: review
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-12
target_completion: 2026-06-12
stages:
  - stage-001-canon-projection-audit
  - stage-002-diff-and-merge-contract
  - stage-003-review-ui-and-audit-ledger
  - stage-004-regression-and-docs
dependencies:
  - plan-032-worldbuilding-generation-engine
  - plan-036-context-priority-generation
  - plan-037-agentic-worldbuild-scan
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Upgrade worldbuilding proposal acceptance from insert-only projection to an author-reviewable canon diff and merge system.

The world-building engine should help maintain canon over time: propose new entities, detect likely duplicates, update existing entities safely, project relationships, and preserve an audit trail for every accepted or rejected change.

## Scope

**In scope:**

- Audit current worldbuilding generation, scan proposals, checkpoint projections, and canon table writes.
- Define a typed diff model for create, update, merge, link, and no-op proposals.
- Add duplicate detection beyond exact normalized names where feasible.
- Support relationship/link projection for characters, factions, locations, lore, plot threads, timeline events, themes, and glossary terms where the schema allows it.
- Improve proposal review UI so authors can inspect field-level changes before acceptance.
- Preserve local-first operation and explicit author acceptance before canon mutation.

**Out of scope:**

- Cloud sync or collaboration.
- Full vector retrieval implementation unless selected as the duplicate-detection mechanism in the expanded plan.
- Automatic canon mutation without author review.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Canon Projection Audit](stage-001-canon-projection-audit/stage.md) | `complete` | TBD |
| 002 | [Diff & Merge Contract](stage-002-diff-and-merge-contract/stage.md) | `complete` | TBD |
| 003 | [Review UI & Audit Ledger](stage-003-review-ui-and-audit-ledger/stage.md) | `complete` | TBD |
| 004 | [Regression & Docs](stage-004-regression-and-docs/stage.md) | `complete` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **lint** — zero lint errors
- [x] **lint:css** — zero CSS lint errors
- [x] **typecheck** — zero type errors and zero warnings
- [x] **tests** — Vitest suite passes
- [x] **e2e** — worldbuilding proposal accept/reject flow covers create and update/merge decisions
- [x] **check:tokens** — zero token violations
- [x] **docs_sync** — worldbuilding and AI pipeline docs describe diff/merge behavior and audit guarantees

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Merge semantics become too broad for one plan | high | Start with a minimal typed diff contract and one or two high-value entity families before expanding |
| Duplicate detection produces false positives | medium | Present duplicates as review evidence, not automatic blocking |
| Canon update UI becomes too complex | medium | Use field-level summaries and progressive details; keep accept/reject decisions explicit |

## Notes

Implementation closed out 2026-06-12 and awaiting plan-level Reviewer evaluation. Do not mark the plan `complete` until Reviewer sign-off is recorded.
