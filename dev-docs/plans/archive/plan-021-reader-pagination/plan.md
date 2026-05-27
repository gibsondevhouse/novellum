---
title: Reader Pagination & Empty State
slug: plan-021-reader-pagination
version: 1.0.0
status: retired
owner: Planner Agent
created: 2026-05-03
last_updated: 2026-05-27
target_completion: 2026-05-17
stages:
  - stage-001-empty-state
  - stage-002-page-margins-and-typography
  - stage-003-pagination-engine
  - stage-004-verification
dependencies:
  - plan-020-fixes-and-nova-identity
quality_gates:
  - lint
  - typecheck
  - tests
  - visual_regression
  - manual_smoke
---

## Objective

Make the reader interface render a novel the way a reader expects:
margined pages, real page breaks, and a graceful empty state when
no story or novel is selected. Currently the reader displays text
in a single full-bleed column with no pagination, which makes long-
form prose unreadable and the surface unusable for its primary
purpose.

Source: [problems-found-001.md](../../qa-docs/user-problems/problems-found-001.md) Problem 002.

## Scope

**In scope:**

- Reader empty state: when no book/story is selected, show a
  branded "no story selected" panel with a CTA to pick or create one.
- Page geometry: real margins (top/right/bottom/left) using design
  tokens; fixed maximum text column width matching a typical
  paperback measure (~65–75ch).
- Pagination engine: split prose into discrete pages whose content
  fits the page box, with hard `break-before`/`break-inside`
  semantics. Spec the strategy (CSS paged media vs. JS-driven
  measurement) and implement the more stable option for our
  long-form HTML inputs.
- Page navigation UI: previous/next page controls and a current
  page indicator.

**Out of scope:**

- "Default reader view" preference (book vs scroll). Owned by
  plan-022 settings IA. This plan ships only the book/paged view;
  the scroll fallback is plan-022 territory.
- Editor → reader handoff with current-scene scroll. Owned by
  plan-023 (editor redesign). This plan ensures the reader can
  *receive* a target page id, but the calling site is plan-023.
- Any TTS/audio reader features.

## Stages

| #   | Stage                                                                              | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Empty state](stage-001-empty-state/stage.md)                                      | `draft` | 0.5d          |
| 002 | [Page margins & typography](stage-002-page-margins-and-typography/stage.md)        | `draft` | 1d            |
| 003 | [Pagination engine](stage-003-pagination-engine/stage.md)                          | `draft` | 2d            |
| 004 | [Verification](stage-004-verification/stage.md)                                    | `draft` | 0.5d          |

## Quality Gates

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all Vitest suites pass; new tests for pagination
      logic and empty-state rendering
- [ ] **visual_regression** — Playwright visual diffs for: empty
      state, first page, mid-document page, last page
- [ ] **manual_smoke** — load a 10k-word document, page through
      it, confirm no overflow, no orphan text, no clipped lines

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| CSS paged media unreliable across embedded WebKit (Tauri) | medium | stage-003 phase-001 spikes both CSS-paged and JS-measured; pick stable one |
| Pagination engine performance degrades on large manuscripts | medium | virtualize: only mount adjacent pages; measure offscreen |
| Long words / preformatted blocks break the column | low | apply `overflow-wrap: anywhere` plus tested fallback for code/quote blocks |
