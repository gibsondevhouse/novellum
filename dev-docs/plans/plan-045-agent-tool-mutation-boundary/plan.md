---
title: Agent Tool Mutation Boundary
slug: plan-045-agent-tool-mutation-boundary
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-09
last_updated: 2026-06-09
target_completion: ~
stages:
  - stage-001-tool-capability-audit
  - stage-002-tool-policy-contract
  - stage-003-ui-issued-mutation-commands
  - stage-004-regression-and-docs
dependencies:
  - plan-031-nova-vscode-copilot-parity
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
---

## Objective

Guarantee that model-callable Agent mode tools cannot directly mutate manuscript or canon state.

Agent mode may read context and create review artifacts, but accept/apply/reject mutations must be issued by explicit UI actions or trusted app commands, not by model tool calls.

## Scope

**In scope:**

- Audit all registered Nova tools and classify each as read-only, review-artifact generation, or mutation.
- Remove `authorDraft.accept_checkpoint` and similar accept/apply operations from model-callable tool advertisement.
- Keep checkpoint generation tools available when they only create review artifacts.
- Introduce a UI-issued mutation command boundary for accept/reject flows that already require author intent.
- Add source-contract tests that fail if model-callable tools import or call mutation APIs directly.

**Out of scope:**

- Removing explicit user accept/reject buttons.
- Changing server-side stale guards or transaction protections except to support the boundary.
- Building a full role-based permissions system.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Tool Capability Audit](stage-001-tool-capability-audit/stage.md) | `draft` | TBD |
| 002 | [Tool Policy Contract](stage-002-tool-policy-contract/stage.md) | `draft` | TBD |
| 003 | [UI-Issued Mutation Commands](stage-003-ui-issued-mutation-commands/stage.md) | `draft` | TBD |
| 004 | [Regression & Docs](stage-004-regression-and-docs/stage.md) | `draft` | TBD |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **lint:css** — zero CSS lint errors
- [ ] **typecheck** — zero type errors and zero warnings
- [ ] **tests** — Vitest suite passes
- [ ] **e2e** — author draft review gates prove no model-callable path applies manuscript changes
- [ ] **check:tokens** — zero token violations
- [ ] **docs_sync** — Agent mode docs state the mutation boundary clearly

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Agent mode loses useful end-to-end drafting behavior | medium | Preserve generation/list/read tools and render review cards for author action |
| Hidden mutation tools remain registered through side effects | medium | Add registry-level tests that inspect advertised tools by capability class |
| Server routes remain callable outside UI | low | Treat local API as trusted app boundary but ensure Nova model loop cannot call those routes as tools |

## Notes

The full draft plan tree has been scaffolded through stages, phases, parts, checklists, implementation logs, and evidence README files. Status remains `draft`; no implementation work has started and tracker files have not been changed.

