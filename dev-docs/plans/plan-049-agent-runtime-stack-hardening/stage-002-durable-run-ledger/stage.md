---
title: Durable Run Ledger
slug: stage-002-durable-run-ledger
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-049-agent-runtime-stack-hardening
phases:
  - phase-001-run-ledger-schema
  - phase-002-run-repository-api
estimated_duration: TBD
risk_level: high
---

## Goal

Persist agent runs, steps, tool calls, artifacts, usage, errors, and review links in SQLite so runtime behavior is durable and auditable.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Run Ledger Schema](phase-001-run-ledger-schema/phase.md) | `draft` | TBD |
| 002 | [Run Repository API](phase-002-run-repository-api/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 001 runtime contract is accepted.
- SQLite migration conventions and project metadata compatibility are understood.

## Exit Criteria

- SQLite schema and migrations exist for durable runtime state.
- Server-side repositories expose typed APIs for creating, updating, querying, and redacting runtime records.
- Tests prove migration idempotency and basic ledger operations.

## Notes

The ledger must store runtime metadata and links. It should not become a second source of truth for manuscript or canon content.
