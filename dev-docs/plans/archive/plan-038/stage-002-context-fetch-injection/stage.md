---
title: Context Fetch Injection
slug: stage-002-context-fetch-injection
stage_number: 2
status: complete
owner: Backend Agent
plan: plan-038-novel-engine-v1
phases:
  - phase-001-buildcontext-fetch-param
estimated_duration: 0.5d
risk_level: medium
---

## Goal

Make `buildContext` work correctly when called from SvelteKit server routes by threading
an optional `fetch` function through to `apiGet`, replacing reliance on global `fetch` which
fails with relative URLs in server execution contexts.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [buildContext Fetch Parameter](phase-001-buildcontext-fetch-param/phase.md) | `draft` | 0.5d |

## Entry Criteria

- `buildContext` in `src/lib/ai/context-engine.ts` is the active context-building function.
- `/api/ai/+server.ts` `handleTask` function calls `buildContext(task, projectId)`.

## Exit Criteria

- All phases complete.
- `buildContext` accepts an optional `fetch` option (defaults to global fetch for client use).
- `/api/ai/+server.ts` passes `event.fetch` to `buildContext`.
- No relative-URL failures when the AI route is called server-side.

## Notes

Risk is medium because `context-engine.ts` has many callers. The change must be fully
backward-compatible — the `fetch` parameter must be optional with a sensible default so
client-side callers (e.g., `continuity-agent.ts`) continue to work unchanged.
