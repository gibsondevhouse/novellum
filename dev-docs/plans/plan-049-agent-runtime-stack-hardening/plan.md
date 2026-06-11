---
title: Agent Runtime Stack Hardening
slug: plan-049-agent-runtime-stack-hardening
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-11
last_updated: 2026-06-11
target_completion: ~
stages:
  - stage-001-runtime-inventory-and-contract
  - stage-002-durable-run-ledger
  - stage-003-local-job-execution
  - stage-004-model-budget-and-memory-capabilities
  - stage-005-observability-evals-diagnostics
dependencies:
  - plan-043-outline-pipeline-consolidation
  - plan-044-nova-active-context-routing
  - plan-045-agent-tool-mutation-boundary
  - plan-046-pipeline-checkpoint-contract-reconciliation
  - plan-047-worldbuilding-canon-merge-diff
  - plan-048-frontend-experience-coherence
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Add the local-first runtime infrastructure Novellum needs to operate as a production agentic novel and world-building engine without replacing the current stack.

This plan strengthens the existing SvelteKit, Tauri, SQLite, OpenRouter/Ollama, and Zod architecture with durable agent runs, local job execution, model capability metadata, token/cost controls, search and memory baseline, AI traces, eval fixtures, and exportable diagnostics.

## Scope

**In scope:**

- Inventory every current agent, pipeline, checkpoint, tool-call, and AI provider path that needs durable runtime support.
- Define a canonical runtime contract for agent runs, steps, tool calls, artifacts, review gates, cancellations, retries, errors, and cost accounting.
- Add SQLite-backed persistence for agent run ledgers and job queue records.
- Add local worker execution semantics for long-running outline, drafting, and world-building tasks.
- Add a model capability registry for tools, JSON schema, streaming, context length, provider, and cost metadata.
- Add token and cost budgeting that can be enforced before and during agent runs.
- Add a search and memory baseline using local SQLite FTS before considering embeddings or vector search.
- Add AI trace capture, deterministic eval fixtures, local diagnostics, and exportable support bundles.
- Update tests and docs so agent runtime behavior is observable, auditable, and recoverable.

**Out of scope:**

- Replacing the local-first SQLite architecture with Postgres, Redis, or a cloud database.
- Adding LangChain, LlamaIndex, cloud vector databases, or SaaS telemetry.
- Allowing model-callable tools to mutate manuscript or canon state directly.
- Reworking product UX beyond what is needed to expose runtime status, retry, diagnostics, and review-safe progress.
- Adding embeddings before the SQLite FTS baseline proves insufficient.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Runtime Inventory & Contract](stage-001-runtime-inventory-and-contract/stage.md) | `draft` | TBD |
| 002 | [Durable Run Ledger](stage-002-durable-run-ledger/stage.md) | `draft` | TBD |
| 003 | [Local Job Execution](stage-003-local-job-execution/stage.md) | `draft` | TBD |
| 004 | [Model, Budget & Memory Capabilities](stage-004-model-budget-and-memory-capabilities/stage.md) | `draft` | TBD |
| 005 | [Observability, Evals & Diagnostics](stage-005-observability-evals-diagnostics/stage.md) | `draft` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** - zero lint errors
- [ ] **lint:css** - zero CSS lint errors
- [ ] **typecheck** - zero type errors and zero warnings
- [ ] **tests** - Vitest suite passes
- [ ] **e2e** - targeted Nova, outline, author draft, worldbuilding, and recovery flows pass
- [ ] **check:tokens** - zero token violations
- [ ] **migration_tests** - SQLite migrations are idempotent from empty and existing databases
- [ ] **runtime_recovery** - interrupted and failed runs can be inspected and resumed or safely dismissed
- [ ] **docs_sync** - developer and user docs describe local runtime behavior and diagnostics

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Runtime hardening turns into a stack rewrite | medium | Keep SQLite and existing provider abstractions as the base; require explicit plan amendment for new platform dependencies |
| Background execution mutates author content without review | high | Route all mutation-like results through existing checkpoint and proposal acceptance contracts |
| Queue and ledger schemas duplicate checkpoint state | medium | Store runtime metadata separately and link to checkpoint/proposal/artifact IDs instead of copying domain state |
| Token and cost tracking becomes inaccurate across providers | medium | Capture estimated and provider-reported usage separately, with model capability metadata documenting confidence |
| Traces leak secrets or manuscript content into diagnostics | high | Redact credentials, allow local-only diagnostics, and make support bundle export explicit |

## Notes

This plan exists because plans 043-048 improve engine contracts and frontend coherence, but they still need durable runtime infrastructure underneath them. Keep this plan deferred until the core mutation boundaries are stable, then execute it before the heaviest frontend coherence and production readiness work.
