---
title: Observability and Model Budget
slug: plan-047-observability-model-budget
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Instrument the AI pipeline with token-usage tracking, per-session and per-project cost
estimation, and structured error telemetry for failed AI calls. This is Development
Path 5 in GEMINI.md ("Observability, reliability, and model-budget optimization") and
is a prerequisite for confident public release.

## Scope

**In scope:**

- Token usage tracking: capture `prompt_tokens`, `completion_tokens`, and
  `total_tokens` from every AI response and persist to a `usage_log` table in SQLite.
- Per-project and per-session usage rollups surfaced in the Settings → AI panel:
  total tokens used, estimated cost (model price list maintained in config).
- Model price list: a static config file mapping `model_id → $/1k tokens (input/output)`
  that the Settings UI and cost estimator read from; updatable without a code change.
- Budget alerts: author can set a per-project token budget; Nova warns (non-blocking)
  when the budget is exceeded.
- Error telemetry: structured logging for AI call failures (timeout, rate-limit,
  parse error) surfaced in Settings → AI as a recent-errors log with retry context.
- `/api/ai` proxy hardening: standardized error envelope so the client always receives
  a typed error rather than an unstructured catch.

**Out of scope:**

- Cloud telemetry / analytics (all data stays local).
- Automatic throttling or circuit-breaking (warning only in this plan).
- Per-agent cost breakdown (project-level rollup is sufficient for v1 observability).

## Stages

| #   | Stage                                                     | Est. Duration |
| --- | --------------------------------------------------------- | ------------- |
| 001 | `usage_log` schema, migration, and capture in AI proxy    | 1d            |
| 002 | Model price list config and cost calculation service      | 0.5d          |
| 003 | Settings → AI usage panel (rollups, cost estimate)        | 1d            |
| 004 | Budget alert system and per-project budget setting        | 0.5d          |
| 005 | Error telemetry log and `/api/ai` error envelope hardening| 1d            |
| 006 | Tests and docs sync                                       | 0.5d          |

## Quality Gates

- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass, usage capture and rollup logic covered
- [ ] `pnpm check:tokens` — zero violations
- [ ] Manual QA: make 3 AI calls → verify usage_log entries → verify Settings panel shows correct totals

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Provider does not return token counts in streaming responses | medium | Capture counts from the final `[DONE]` event or estimate from character count |
| Model price list goes stale | low | Price list is a plain config file; document that it requires manual update when providers change pricing |

## Notes

The `usage_log` table is append-only; cost estimates are informational, not billing.
This plan intentionally avoids cloud telemetry — all data stays in the local SQLite
database. The structured error envelope for `/api/ai` also benefits every other plan
that calls the AI proxy, making this a good prerequisite for plan-045 (image gen)
and plan-046 (search) which add new AI call paths.
