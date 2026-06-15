---
title: Search Memory Baseline
slug: phase-002-search-memory-baseline
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-004-model-budget-and-memory-capabilities
parts:
  - part-001-search-memory-baseline
estimated_duration: TBD
---

## Goal

Add local project search and memory retrieval baseline using SQLite FTS before considering embeddings.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Search Memory Baseline](part-001-search-memory-baseline/part.md) | `draft` | unassigned | TBD |

## Acceptance Criteria

- [ ] SQLite FTS indexes cover manuscript, outline summaries, characters, locations, lore, plot threads, timeline events, and accepted generated artifacts where appropriate.
- [ ] Context builders can request ranked local search results without sending the full manuscript.
- [ ] Tests prove indexing, updates, deletes, ranking, and project isolation.

## Notes

This is a memory baseline. Vector search remains a future decision based on evidence.
