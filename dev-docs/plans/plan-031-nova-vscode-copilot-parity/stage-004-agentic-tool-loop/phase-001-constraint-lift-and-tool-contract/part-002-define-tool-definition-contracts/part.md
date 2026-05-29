---
title: Define Tool Definition Contracts
slug: part-002-define-tool-definition-contracts
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-constraint-lift-and-tool-contract
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Define Tool Definition Contracts

## Objective

Finalize tool input/output contracts so registry entries, router dispatch, UI chips, and tests agree.

## Scope

**In scope:**

- Finalize tool input/output contracts so registry entries, router dispatch, UI chips, and tests agree.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Review existing `ToolDefinition` shape and avoid API invention where it already exists.
2. Define read-tool result envelope and proposal-tool result envelope.
3. Add explicit error envelope for tool failures.
4. Ensure contracts can be rendered by tool chips without exposing raw internals.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/types.ts`

## Acceptance Criteria

- [ ] Tool registry entries have schemas, labels, risk level, and renderer metadata where supported.
- [ ] Tool results can be appended back to the model as `tool_result` messages.
- [ ] Proposal tools cannot represent an applied mutation.

## Edge Cases

- Tool input schema validation failure must become a tool error result, not an uncaught stream crash.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
