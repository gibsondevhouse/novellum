---
title: Editor Redesign & Nova Copilot
slug: plan-023-editor-redesign-and-nova-copilot
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-03
last_updated: 2026-05-04
target_completion: 2026-06-21
stages:
  - stage-001-editor-page-geometry
  - stage-002-editor-toolbar-pillnav
  - stage-003-view-in-reader-handoff
  - stage-004-nova-module-scaffold
  - stage-005-nova-chat-and-rag
  - stage-006-nova-agentic-stubs
  - stage-007-preference-consumption
  - stage-008-verification
dependencies:
  - plan-021-reader-pagination
  - plan-022-settings-ia
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - visual_regression
  - manual_smoke
---

## Objective

Rebuild the editor surface to read and feel like a word processor
rather than a Medium-style canvas, and replace its in-content AI
command bar with **Nova**, a right-side copilot panel that owns
chat, AI commands, and (in future) agentic world-building.

This plan **scaffolds Nova for full agentic capability** but only
wires chat-response and retrieval-augmented generation (RAG) over
project context in this delivery — agentic tool use, world-building
authoring, and continuity actions are stub interfaces ready for
later activation.

Source: [problems-found-001.md](../../qa-docs/user-problems/problems-found-001.md) Problem 003.

## Scope

**In scope:**

- Editor page geometry: single-page, fixed width, real margins,
  no title field, no full-bleed canvas. Visually approaches a
  word processor.
- Editor toolbar: import the existing PillNav primitive, refactor
  the current main content header into a toolbar pill-nav with
  buttons for text formatting, media insert, spell check, tables,
  view-in-reader, and the slots needed for future word-processor
  features (find/replace, comments, etc.).
- View-in-reader handoff: action opens the entire piece in the
  reader interface, scrolled to the current scene/page. Consumes
  the page-id input plan-021 stage-003 added.
- New `src/modules/nova/` module: full architectural scaffold for
  the copilot. Right-panel shell, message store, streaming state,
  agentic-tool plumbing interfaces, RAG context builder hooks.
- Wired in this plan: chat send/receive over OpenRouter via the
  existing `task-resolver` + `prompt-builder`, with RAG context
  derived from the current scene and adjacent narrative material
  via the existing `ContextEngine` (`scene_plus_adjacent` policy).
- Removal of the in-content AI command header (the surface Nova
  replaces).
- Preference consumption: editor pane reads font size, line
  spacing, and theme from plan-022 preferences; view-in-reader
  honors `defaultReaderView` from plan-022.

**Out of scope:**

- Activation of agentic tool calls beyond chat + RAG. Scaffolded,
  not wired (parked, future plan).
- World-building authoring through Nova — the action interface is
  stubbed, the implementation is future work.
- Continuity-action automation through Nova.
- Multi-pane document editing beyond the current `ManuscriptEditorPane`
  capability.
- Audio / voice input.

## Stages

| # | Stage | Status | Est. |
| --- | --- | --- | --- |
| 001 | [Editor page geometry](stage-001-editor-page-geometry/stage.md) | `draft` | 1.5d |
| 002 | [Editor toolbar PillNav](stage-002-editor-toolbar-pillnav/stage.md) | `draft` | 1.5d |
| 003 | [View-in-reader handoff](stage-003-view-in-reader-handoff/stage.md) | `draft` | 1d |
| 004 | [Nova module scaffold](stage-004-nova-module-scaffold/stage.md) | `draft` | 2d |
| 005 | [Nova chat & RAG](stage-005-nova-chat-and-rag/stage.md) | `draft` | 3d |
| 006 | [Nova agentic stubs](stage-006-nova-agentic-stubs/stage.md) | `draft` | 1d |
| 007 | [Preference consumption](stage-007-preference-consumption/stage.md) | `draft` | 1d |
| 008 | [Verification](stage-008-verification/stage.md) | `draft` | 1d |

## Quality Gates

- [ ] **lint**, **typecheck**, **tests** clean
- [ ] **boundaries** — `nova` module element type added to
      eslint-boundaries; only `routes` and `editor` may consume it
- [ ] **visual_regression** — new editor page state, Nova panel
      open/closed, mobile/narrow viewport behavior
- [ ] **manual_smoke** — write a scene, ask Nova a question that
      requires RAG context, switch to reader from the toolbar and
      confirm the reader scrolls to the current scene

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Right-panel takes too much horizontal space on small screens | medium | panel collapses to icon rail under a min-width threshold |
| RAG context construction leaks unrelated manuscript content | medium | reuse documented `scene_plus_adjacent` policy; unit-test the slice |
| Removing the title field breaks downstream consumers (hub, exports) | medium | scene title still exists in the data model; only the editor input is removed; verify exports + hub still render titles |
| PillNav re-skin diverges from existing usages | low | stylist owns toolbar variant; visual regression on each existing PillNav consumer |
| Nova panel re-renders entire transcript on each token stream tick | medium | message virtualization + per-token append into the last message only |
