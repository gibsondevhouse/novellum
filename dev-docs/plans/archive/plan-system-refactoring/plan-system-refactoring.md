---
title: System Refactoring & Stabilization
slug: system-refactoring
version: 1.0.0
status: superseded
superseded_by: plan-017-v1-trust-foundation
owner: planner-agent
created: 2026-04-14
last_updated: 2026-04-28
target_completion: 2026-05-15
stages:
  - stage-001-state-unification
  - stage-002-data-hardening
  - stage-003-ai-activation
dependencies: []
quality_gates:
  - all tests pass
  - linting passes (including eslint-plugin-boundaries)
  - typescript check passes
---

# Strategic Anchor: System Refactoring & Stabilization

## Mission
Unify the architectural paradigms of Novellum. Resolve the fragmentation between Svelte 4/5 state, simplify the SQLite/Dexie portability model, and implement the real streaming AI pipeline.

## Context
Novellum is transitioning into an enterprise-grade local-first application. The current state has "architectural debt" due to partial migrations (Svelte 5, SQLite backend). To ensure maintainability and performance for large novel projects, we must solidify the foundational layers before adding new features.

## Architectural Goals
1. **100% Svelte 5 Runes**: Eliminate all legacy `svelte/store` usage.
2. **Single Source of Truth**: Treat the SQLite `.db` file as the ultimate portability mechanism, deprecating Dexie.
3. **Streaming AI**: Replace the OpenRouter stub with a robust, streaming-capable HTTP client using SSE.
