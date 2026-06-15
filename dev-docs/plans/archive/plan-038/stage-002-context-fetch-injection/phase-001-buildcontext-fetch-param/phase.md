---
title: buildContext Fetch Parameter
slug: phase-001-buildcontext-fetch-param
phase_number: 1
status: complete
owner: Backend Agent
stage: stage-002-context-fetch-injection
parts:
  - part-001-fetch-di
estimated_duration: 0.5d
---

## Goal

Add an optional `fetch` parameter to `buildContext` and thread it through `apiGet` calls,
then wire `event.fetch` from the `/api/ai` route handler.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Fetch DI for buildContext](part-001-fetch-di/part.md) | `draft` | Backend Agent | 0.5d |

## Acceptance Criteria

- [ ] `buildContext(task, projectId, { fetch? })` signature works — optional third options arg.
- [ ] All `apiGet(...)` calls inside `context-engine.ts` use the injected fetch when provided.
- [ ] `handleTask` in `+server.ts` passes `event.fetch` via the options argument.
- [ ] Existing client-side callers (no third arg) continue to work — no regressions.
- [ ] `pnpm check` — 0 errors.
- [ ] `pnpm test` — all tests pass.

## Notes

The `apiGet` helper in `src/lib/api-client.ts` uses global `fetch` directly. The cleanest
approach is to pass the `fetch` function as a local argument through the context-engine
functions rather than mutating the module-level client.
