---
title: OpenRouter Client Refactor
slug: phase-003-openrouter-client-refactor
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-005-byok-security
parts:
  - part-001-route-refactor
estimated_duration: 0.5d
---

## Goal

Reduce `src/lib/ai/openrouter.ts` to a thin re-export over the new provider, and remove every fallback to environment variables in the runtime AI route.

## Parts

| #   | Part                                                                  | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Route + Client Refactor](part-001-route-refactor/part.md)            | `draft` | ai          | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/ai/openrouter.ts` is either deleted or reduced to a single re-export of the provider module.
- [ ] `src/routes/api/ai/+server.ts` no longer falls back to `OPENROUTER_API_KEY` env or any mock-response path outside an explicitly named dev-only flag.
- [ ] `.env.example` no longer surfaces `VITE_OPENROUTER_API_KEY` for production builds.
- [ ] `tests/ai/credential-redaction.test.ts` is extended to assert the AI route never echoes the supplied key.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- The dev-only mock-response flag (if retained) must be guarded by `NOVELLUM_AI_MOCK=1` and warn at startup when active.
