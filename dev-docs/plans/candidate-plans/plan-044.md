---
title: Summary Agent
slug: plan-044-summary-agent
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Re-introduce `SummaryAgent` (cut from internal V1 in plan-025) to close the **editorial
end** of the author pipeline. Authors working on large manuscripts need on-demand
summaries at multiple granularities — scene, chapter, arc — to maintain continuity
awareness and to feed Nova's context window more efficiently.

## Scope

**In scope:**

- `SummaryAgent` service in `src/lib/ai/` with configurable granularity target
  (`scene` | `chapter` | `arc`).
- Summary trigger in the editor surface: a Nova action that summarizes the current
  scene or chapter on demand.
- Summary display: inline collapsible panel in the editor sidepanel; summary is
  read-only and non-destructive.
- Arc-level rollup: a hub-level action that summarizes all chapters in an arc.
- Summaries stored in `scenes.summary` / `chapters.summary` columns (or a
  dedicated `summaries` table if schema change is warranted).
- `ContinuityAgent` can pull stored summaries as lightweight context instead of
  full scene text, reducing token cost for large works.

**Out of scope:**

- Auto-summarization on save (always author-triggered).
- Summary diff / version history.
- Cross-arc synthesis summaries ("summarize the whole novel").

## Stages

| #   | Stage                                              | Est. Duration |
| --- | -------------------------------------------------- | ------------- |
| 001 | Agent contract, prompt, and schema; DB columns     | 1d            |
| 002 | Editor surface trigger and inline summary panel    | 1d            |
| 003 | Arc-level rollup and hub integration               | 1d            |
| 004 | ContinuityAgent context integration + tests        | 1d            |

## Quality Gates

- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass, new agent tests included
- [ ] `pnpm check:tokens` — zero violations
- [ ] Manual QA: summarize scene → summarize chapter → arc rollup → ContinuityAgent uses stored summary

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| DB schema change breaks existing portability snapshots | medium | Add summary columns as nullable; migration script required |
| Summary quality degrades on very short scenes | low | Minimum length guard — skip summarization if scene < 200 words |

## Notes

`SummaryAgent` was declared as a `TaskType` but never wired (cut by plan-025). This plan
also directly benefits large-novel performance: storing summaries lets the `ContinuityAgent`
avoid re-reading full scene text on every invocation, which is the main token-budget
pressure for 100k+ word manuscripts. Sequence with plan-048 (large-novel performance
harness) in mind — this plan's stored summaries are an input to that benchmark.
