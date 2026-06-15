---
title: Local-First Search and Semantic Indexing
slug: plan-046-local-search-semantic-indexing
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
  - plan-044-summary-agent
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Add full-text and semantic search across manuscript content, worldbuilding entities,
and scene metadata — entirely local, no cloud index. Improve Nova's context retrieval
from recency/hierarchy-based to relevance-based, reducing token cost and increasing
answer quality for large works.

## Scope

**In scope:**

- SQLite FTS5 full-text search index over `scenes.content`, `chapters.title`,
  worldbuilding entity fields (names, descriptions, notes).
- Search UI: a command-palette-style global search (`Cmd+K` or dedicated route)
  returning ranked results across all content types.
- Semantic / embedding-based retrieval: generate embeddings for scenes and
  worldbuilding entities using a local or provider-backed embedding model;
  store vectors in a SQLite extension (e.g., `sqlite-vec`) or a sidecar index.
- Nova context upgrade: `ContextEngine` gains a `semantic_search` retrieval
  strategy alongside the existing `hierarchy` strategy; strategy is selected
  per-agent or per-invocation.
- Index rebuild on demand (after bulk import or restore) and incremental update
  on content save.

**Out of scope:**

- Cloud search backends.
- Cross-project search.
- Real-time collaborative indexing.

## Stages

| #   | Stage                                                        | Est. Duration |
| --- | ------------------------------------------------------------ | ------------- |
| 001 | FTS5 schema, migration, and index population                 | 1d            |
| 002 | Search API route and command-palette UI                      | 1.5d          |
| 003 | Embedding model integration and vector storage               | 2d            |
| 004 | `ContextEngine` semantic retrieval strategy                  | 1.5d          |
| 005 | Index rebuild tooling and incremental update on save         | 1d            |
| 006 | Tests, benchmark on large fixture, docs sync                 | 1d            |

## Quality Gates

- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass
- [ ] `pnpm check:tokens` — zero violations
- [ ] Manual QA: search returns relevant results; Nova answer quality improves on large project
- [ ] Performance: FTS5 query p95 < 50ms on 100k-word fixture

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| `sqlite-vec` or equivalent extension not available on all target platforms | medium | Fall back to pure-SQLite cosine similarity on a float blob column if extension is unavailable |
| Embedding generation is slow on first index build for large works | medium | Background indexing with progress indicator; do not block the UI |
| Vector storage grows large for long manuscripts | low | Store embeddings at chunk level (scene/paragraph), not word level |

## Notes

The `SummaryAgent` (plan-044) produces stored summaries that are ideal embedding inputs —
summarized text produces more discriminative vectors than raw prose. This plan should be
sequenced after plan-044 so the embedding index can use summaries where available and
fall back to raw text otherwise. The large-novel performance fixture (plan-048) is the
benchmark harness for the p95 query timing gate.
