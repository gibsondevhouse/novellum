---
title: Visual Manuscript Diff & Prose Injector
slug: plan-056-visual-manuscript-diff
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-25
target_completion: 2026-07-29
stages:
  - stage-001-prose-diff-helper
  - stage-002-split-screen-diff-ui
  - stage-003-partial-injector
  - stage-004-verification
dependencies:
  - plan-055-outline-diff-merge
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Build a visual split-screen diff interface and a partial prose injector. This resolves the current gap where accepting an AI scene-draft ([NovaSceneDraftCard.svelte](file:///Users/gibdevlite/dev/novellum/src/modules/nova/components/NovaSceneDraftCard.svelte)) overwrites the scene text without displaying a visual comparison of changes, helping authors retain full edit-level control.

## Scope

**In scope:**
- An inline or split-screen text diff calculator (using `diff-match-patch` or a light Svelte-friendly diff library) comparing current scene prose against generated drafts.
- A "Review Changes" modal triggered from the Nova scene-draft cards.
- Support for "Selective Apply" (allowing authors to select specific paragraphs, sentences, or diff hunks from the draft and insert only those into the editor).
- Proper selection highlight and cursor positioning restoration post-injection.

**Out of scope:**
- Rich text format conversions (styling, fonts) inside the diff view (diff operates on clean markdown/prose).
- Editing the draft prose *within* the diff view (the author edits in the primary editor).

## Stages

| #   | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Text Diff Computation Helper](stage-001-prose-diff-helper/stage.md) | `complete` | 1d |
| 002 | [Split-Screen Diff UI Component](stage-002-split-screen-diff-ui/stage.md) | `complete` | 2d |
| 003 | [Partial Prose Injector Actions](stage-003-partial-injector/stage.md) | `complete` | 2d |
| 004 | [Verification & Quality Gate Closure](stage-004-verification/stage.md) | `complete` | 1d |

## Quality Gates

- [x] **lint** — zero ESLint or CSS warnings
- [x] **typecheck** — zero compilation warnings in `pnpm check`
- [x] **tests** — unit coverage for partial insertion text calculations
- [x] **docs_sync** — update [pipeline.md](../../03-ai/pipeline.md)

## Risks & Mitigations
- **Risk:** Complex diff blocks (such as major re-orderings) might look messy in a standard inline diff view.
- **Mitigation:** Provide toggleable views: "Split Screen" (side-by-side highlighting) and "Unified" (inline additions/deletions) to let the author choose the clearest layout.
