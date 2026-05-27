---
title: Audit Ollama + Shortcuts Surface and Tests
slug: part-001-audit-ollama-shortcuts-surface-and-tests
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-002-ollama-shortcuts-closeout-path
started_at: 2026-05-27T17:10:00Z
completed_at: 2026-05-27T17:15:00Z
estimated_duration: 0.5d
---

## Objective

Audit current Ollama/provider routing and global shortcut behavior against deferred stage-003 commitments, including tests.

## Scope

**In scope:**

- `src/lib/keyboard/global-handler.ts` and `keymap-registry.ts` behavior.
- Shortcuts settings route behavior and tests.
- Ollama/OpenRouter provider routes and launcher integration.

**Out of scope:**

- Implementing net-new provider/shortcut features.
- Replacing shortcut architecture.

## Implementation Steps

1. Audit shortcut dispatch/install/recording/conflict behavior and test coverage.
2. Audit provider orchestration and ollama startup/fallback behavior.
3. Map audited behavior to deferred stage-003 commitments.
4. Publish audit artifact.

## Files

**Create:**

- `evidence/ollama-shortcuts-audit-2026-05-27.md`

**Update:**

- `impl.log.md`

## Acceptance Criteria

- [ ] Shortcut and provider commitments have shipped/pending classification.
- [ ] Evidence includes code and test references.
- [ ] Any key-boundary risk is explicitly flagged.

## Edge Cases

- If a behavior is covered in code but not tests, classify as shipped-with-test-gap.

## Notes

Maintain in-house shortcut and provider abstractions.
