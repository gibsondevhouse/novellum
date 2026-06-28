---
title: AI Context Control Panel
slug: plan-057-context-control-panel
version: 1.0.0
status: review
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-28
target_completion: 2026-08-05
stages:
  - stage-001-context-metadata-enrichment
  - stage-002-sidebar-context-pill
  - stage-003-pinning-override-store
  - stage-004-verification
dependencies:
  - plan-056-visual-manuscript-diff
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Build a dedicated AI Context Control Panel inside the Nova sidebar workspace. This panel will surface exactly what characters, locations, and lore entries are being compiled into the AI context window during a query, and give authors the capability to manually pin or exclude specific files or entities to prevent hallucination.

## Scope

**In scope:**

- Extending the server-side context packet builder to accept explicit `pinnedEntityIds` and `excludedEntityIds` from the client request.
- Visualizing token budget estimates, context size, and potential truncation issues directly to the author before they execute a generation step.
- An interactive sidebar drawer listing "Implicit Context" (automatically gathered via RAG) and letting the author manually toggle entities as "Pinned" (must-include) or "Excluded" (must-ignore).
- Storing these overrides at the scene-level in project metadata.

**Out of scope:**

- Modifying the underlying RAG vector searching algorithms.
- Custom vector database parameter tuning from the UI.

## Stages

| #   | Stage                                                                              | Status        | Est. Duration |
| --- | ---------------------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Context Selection API Overrides](stage-001-context-metadata-enrichment/stage.md)  | `review`      | 2d            |
| 002 | [Context Visualization Drawer UI](stage-002-sidebar-context-pill/stage.md)         | `review`      | 2d            |
| 003 | [Pinning & Exclusion Persistence Store](stage-003-pinning-override-store/stage.md) | `review`      | 1d            |
| 004 | [Verification & Quality Gate Closure](stage-004-verification/stage.md)             | `review`      | 1d            |

## Quality Gates

- [x] **lint** — zero ESLint or CSS warnings
- [x] **typecheck** — zero compilation warnings in `pnpm check`
- [x] **tests** — unit coverage of context assembly with overrides
- [x] **docs_sync** — update [context-engine.md](../../03-ai/context-engine.md)

## Risks & Mitigations

- **Risk:** Authors might pin too many entities, causing the request to exceed the model's token limits.
- **Mitigation:** Highlight a token progress bar in orange/red when approaching context limits and block execution with a helpful warning if context overrides exceed the model's maximum allowed tokens.
