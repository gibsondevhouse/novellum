---
title: Model Selection and Status
slug: phase-005-model-selection-and-status
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-005-byok-security
parts:
  - part-001-models-route-and-store
  - part-002-credential-redaction-tests
estimated_duration: 1d
---

## Goal

Move model selection out of `localStorage` into preferences, expose a `GET /api/ai/models` route backed by the provider, and lock in stage-005 with a comprehensive credential redaction guardrail.

## Parts

| #   | Part                                                                                | Status  | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Models Route + Selection Store](part-001-models-route-and-store/part.md)           | `draft` | ai          | 0.5d          |
| 002 | [Credential Redaction Tests](part-002-credential-redaction-tests/part.md)           | `draft` | reviewer    | 0.5d          |

## Acceptance Criteria

- [ ] `GET /api/ai/models` returns the provider model list (cached for 60s) and never echoes the API key.
- [ ] `src/lib/stores/model-selection.svelte.ts` reads/writes via the preferences API, not `localStorage`.
- [ ] `tests/ai/credential-redaction.test.ts` is extended to cover console output, server logs, exports, and `.novellum` backups; the assertion fails loudly if any path leaks the key.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- The redaction test is the stage's exit gate. Once it goes green across the full surface, the stage is releasable.
