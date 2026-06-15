---
title: Governed AI Controller Runtime
slug: plan-051-governed-ai-controller-runtime
version: 1.0.0
status: review
owner: Planner Agent
created: 2026-06-15
last_updated: 2026-06-15
target_completion: 2026-07-15
stages:
  - stage-001-controller-contracts-and-state-machine
  - stage-002-intent-resolver
  - stage-003-policy-guard
  - stage-004-context-builder
  - stage-005-workflow-router-and-model-gateway
  - stage-006-output-validation-and-artifact-lifecycle
  - stage-007-observability-and-verification
dependencies:
  - plan-049-agent-runtime-stack-hardening
  - plan-048-frontend-experience-coherence
  - plan-047-worldbuilding-canon-merge-diff
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
  - docs_sync
  - manual_verify
---

## Objective

Develop a governed AI controller runtime that inserts an explicit control layer between user actions and all AI, model, and tool execution. This runtime will centralize intent classification, policy enforcement, context assembly, workflow routing, model invocation, output validation, artifact lifecycle management, and observability. By codifying these responsibilities in one place, Novellum can deliver AI-assisted features that are safe, auditable, and consistent.

## Scope

**In scope:**

- Introduce new contracts for AI requests, responses, workflows, and task statuses.
- Build a server-side controller module that orchestrates AI requests end-to-end.
- Replace scattered task resolution and context building with an intent resolver and context builder owned by the controller.
- Add a policy guard to enforce permission boundaries and review-gate semantics before model execution.
- Define a workflow registry that maps intents to known pipelines with explicit schemas, model profiles, and allowed tools.
- Introduce a model gateway that standardizes all provider calls, fallback policies, and logging.
- Validate all AI output against strict schemas and manage artifact lifecycle (`draft` → `review` → `accepted`/`rejected`).
- Implement basic observability through run logs, auditing metadata, and test fixtures.
- Provide initial documentation and developer guidance for extending the controller with new workflows.

**Out of scope:**

- Overhauling the existing SQLite persistence layer or moving away from local-first storage.
- Introducing external vector databases or cloud dependencies.
- Making UX changes outside of what is necessary to expose new controller states (e.g., `awaiting_review`, `accepted`, etc.).
- Adding new author-facing AI features; those will depend on this foundation but are not part of the foundational plan.

## Product Contract

This plan delivers an infrastructure capability rather than a user-visible feature. The primary contract is that all AI-assisted features in Novellum must go through the governed controller runtime. Authors and reviewers will benefit indirectly from consistent behavior: AI suggestions always appear as proposals, context is scoped and disclosed, dangerous operations are blocked, and review gates are enforced.

## Stages

| #   | Stage                                                         | Status | Est. Duration |
| --- | ------------------------------------------------------------- | ------ | ------------- |
| 001 | [Controller Contracts & State Machine](stage-001-controller-contracts-and-state-machine/stage.md) | `review` | 3d |
| 002 | [Intent Resolver](stage-002-intent-resolver/stage.md)         | `review` | 2d |
| 003 | [Policy Guard](stage-003-policy-guard/stage.md)               | `review` | 2d |
| 004 | [Context Builder](stage-004-context-builder/stage.md)         | `review` | 3d |
| 005 | [Workflow Router & Model Gateway](stage-005-workflow-router-and-model-gateway/stage.md) | `review` | 3d |
| 006 | [Output Validation & Artifact Lifecycle](stage-006-output-validation-and-artifact-lifecycle/stage.md) | `review` | 3d |
| 007 | [Observability & Verification](stage-007-observability-and-verification/stage.md) | `review` | 2d |

## Stage Breakdown

### Stage 001 — Controller Contracts & State Machine

Define the foundational contracts and state machine for the AI controller. Establish the request/response types, workflow definitions, and task status enumeration. Implement a skeleton controller that processes an AI request through pre-defined states without calling any model. Introduce a run log schema and wire it to the controller skeleton for observability.

### Stage 002 — Intent Resolver

Create an explicit taxonomy of author intents and a resolver that maps incoming actions to these intents. Replace the existing task resolver with a narrow, deterministic classifier that feeds the workflow router. Provide fallback behavior for unsupported or ambiguous intents.

### Stage 003 — Policy Guard

Establish a permission model that distinguishes between read‑only, proposal‑only, and mutation workflows. Implement a policy guard that evaluates an intent against its workflow definition and either allows execution, blocks it, or requires human approval. Integrate the guard into the controller so no AI call can bypass policy enforcement.

### Stage 004 — Context Builder

Design a unified context packet schema that encapsulates all data required by AI workflows. Build modular context builders that construct these packets from the project, document, and worldbuilding state while respecting token budgets and relevance policies. This stage replaces ad‑hoc context assembly with deterministic, testable functions.

### Stage 005 — Workflow Router & Model Gateway

Register all supported AI workflows with their required context sources, output schemas, allowed tools, and model profiles. Implement a router that dispatches an intent to a workflow, then calls a model gateway that abstracts provider selection, fallback, retries, and logging. This stage centralizes provider interaction and eliminates scattered `fetch()` calls to OpenRouter or Ollama.

### Stage 006 — Output Validation & Artifact Lifecycle

Define strict output schemas for each workflow and enforce them through a validation layer. Introduce an artifact lifecycle model (`draft`, `review`, `accepted`, `rejected`, `failed`) and implement server‑side persistence for draft artifacts. Add endpoints and utilities to accept or reject an artifact, emitting canonical mutations only on acceptance.

### Stage 007 — Observability & Verification

Instrument the controller runtime with run logging, error reporting, and audit metadata. Add unit and integration tests for each layer. Create developer documentation explaining how to add new workflows, how to interpret logs, and how to debug controller behavior. Tie off the plan by updating `MASTER-PLAN.md` and providing evidence for each completed part.

## Guardrails

- The controller must be server‑side only; no direct provider keys or model calls from UI components.
- All AI operations must flow through the controller; existing routes should be refactored or wrapped accordingly.
- Context builders must scope data and cap token budgets; full manuscripts or entire project datasets are never sent to the model.
- Policy guard must prevent any destructive or canon‑altering operation without explicit review.
- Output must be validated before persistence; malformed or unsafe output is rejected and logged.

## Failure Modes & Mitigations

| Failure mode | Severity | Mitigation |
| --- | --- | --- |
| Controller bypass allowing direct `fetch` to model | Critical | Remove scattered model calls; enforce controller usage via lint/architectural tests |
| Missing or invalid context leads to hallucinations | High | Add context sufficiency checks and clear error messages |
| Policy guard misclassifies a destructive operation as safe | High | Define explicit allowed actions per workflow and require reviewer approval for ambiguous cases |
| Output schema drift breaks downstream consumers | Medium | Version output schemas and validate before persistence |
| Run logs leak sensitive data | Medium | Log metadata by default and gate full prompt logging behind a development flag |

## Quality Gates

All stages must satisfy the following gates before plan completion:

- **lint** — zero lint errors
- **lint:css** — zero CSS lint errors
- **typecheck** — zero type errors
- **tests** — Vitest unit/integration suites pass
- **e2e** — Playwright specs for new controller flows pass
- **check:tokens** — zero hardcoded style token violations
- **docs_sync** — developer and user docs updated to reflect controller runtime
- **manual_verify** — Reviewer Agent verifies that the controller prevents accidental mutations and enforces review gates

## Test Expectations

- Unit tests for contract types, policy guard decisions, context builder behavior, and workflow routing.
- API tests for controller endpoints: invalid input, missing context, policy denial, successful draft creation, accept, reject, and failure handling.
- Component tests for any UI surface that reflects new controller states (`loading`, `awaiting_review`, `accepted`, `rejected`, `failed`).
- End‑to‑end tests covering a complete run from user action through controller, model call (mocked), artifact review, and acceptance.

## Acceptance Criteria

- All plan files (plan, stages, phases, parts) are authored with no unresolved placeholders and committed in the repository.
- Existing AI endpoints (`/api/ai`) are refactored to go through the controller runtime or are wrapped so no direct model calls remain.
- New contracts and state types are defined and exported under `src/lib/server/ai/controller/`.
- Intent resolver determines the correct workflow for all existing author actions with fallback for unsupported actions.
- Policy guard blocks destructive operations and requires human approval where appropriate.
- Context builder produces deterministic packets with token budgets enforced.
- Workflow registry lists every supported AI workflow with schema, model profile, and allowed tools.
- Model gateway abstracts provider calls and supports fallback with identical output schemas.
- Output validation rejects malformed responses and writes draft artifacts only after validation.
- Artifact lifecycle transitions are explicit and server‑side only.
- Run logs capture controller execution metadata without exposing secrets or user data.
- Documentation explains how to extend the controller with new workflows and how to interpret logs.

## Evidence Expectations

- One dated evidence artifact per completed part under its `evidence/` directory.
- Logs of `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm typecheck`, `pnpm test`, and targeted `pnpm test:e2e` runs.
- Screenshots or UI render outputs showing new controller states in Nova.
- API response transcripts demonstrating blocked operations, validation errors, draft creation, accept, reject, and failure flows.
- Final closeout note summarizing residual risks and follow‑up work.

## Assumptions

- Existing AI pipeline modules (`task-resolver.ts`, `context-engine.ts`, `model-router.ts`) will remain as lower‑level utilities but will be orchestrated by the new controller.
- The persistence layer remains SQLite via better-sqlite3; any new tables or columns required for run logs or artifacts will be added via migrations in later stages.
- OpenRouter and Ollama remain the primary provider options; additional providers will be added in future plans.
- UI updates will be minimal and will only expose new controller states; deeper UX changes will be handled in separate plans.

## Notes

This plan sets the stage for more advanced AI features by providing a robust foundation. Once the controller runtime is in place, future plans can add new workflows (e.g., RAG‑based answering, timeline synthesis, style rewrites) by defining their contracts, contexts, and outputs without reinventing the AI infrastructure.
