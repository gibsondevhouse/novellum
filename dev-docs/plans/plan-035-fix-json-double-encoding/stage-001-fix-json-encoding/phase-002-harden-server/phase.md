---
title: Harden Server POST Handler
slug: phase-002-harden-server
phase_number: 2
status: review
owner: Planner Agent
stage: stage-001-fix-json-encoding
parts:
  - part-001-harden-createPostHandler
estimated_duration: 0.5d
risk_level: low
---

## Goal

Update `createPostHandler` in `src/lib/server/api-helpers.ts` to detect and tolerate pre-stringified values for `json: true` fields. This prevents future double-encoding bugs from any caller (not just `GeneratedEntityModal`).

## Parts

| #   | Part                                     | Status  | Est. Duration |
| --- | ---------------------------------------- | ------- | ------------- |
| 001 | [Harden createPostHandler](part-001-harden-createPostHandler/part.md) | `review` | 0.5d |

## Entry Criteria

- [ ] Phase 1 (source fixes) is underway or complete
- [ ] Server API helpers reviewed for the exact location to harden

## Exit Criteria

- [ ] `createPostHandler` detects `typeof val === 'string'` and skips re-encoding
- [ ] No lint or type errors
- [ ] Behavior is backward-compatible (raw arrays still work as before)
- [ ] Part marked `complete`

## Notes

- This is a small, defensive change that doesn't break existing callers
- Can be implemented in parallel with Phase 1 (independent)
- Minimal test coverage needed; primary coverage comes from Phase 3 tests
