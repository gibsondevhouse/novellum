---
title: Local Job Execution
slug: stage-003-local-job-execution
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-049-agent-runtime-stack-hardening
phases:
  - phase-001-queue-schema-and-claiming
  - phase-002-worker-lifecycle-and-retry
estimated_duration: TBD
risk_level: high
---

## Goal

Move long-running agent work onto a local SQLite-backed job execution model with deterministic claiming, cancellation, retry, and recovery behavior.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Queue Schema & Claiming](phase-001-queue-schema-and-claiming/phase.md) | `draft` | TBD |
| 002 | [Worker Lifecycle & Retry](phase-002-worker-lifecycle-and-retry/phase.md) | `draft` | TBD |

## Entry Criteria

- Durable run ledger repository APIs are available.
- Runtime contract defines job and run lifecycle states.

## Exit Criteria

- Local job records can be enqueued, claimed, heartbeat-updated, cancelled, failed, retried, and completed.
- Worker lifecycle integrates with run ledger records and review-gated artifacts.
- Tests prove recovery from stale claims and interrupted runs.

## Notes

Do not introduce Redis, cloud queues, or background SaaS. The queue is local-first and SQLite-backed.
