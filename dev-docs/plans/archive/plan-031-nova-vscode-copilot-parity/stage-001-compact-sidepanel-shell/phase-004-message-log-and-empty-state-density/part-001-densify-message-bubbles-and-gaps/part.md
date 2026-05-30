---
title: Densify Message Bubbles and Gaps
slug: part-001-densify-message-bubbles-and-gaps
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-004-message-log-and-empty-state-density
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Densify Message Bubbles and Gaps

## Objective

Reduce inter-message spacing and bubble padding while maintaining readable assistant/user distinction.

## Scope

**In scope:**

- Reduce inter-message spacing and bubble padding while maintaining readable assistant/user distinction.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Reduce inter-message gap toward 6px using tokens.
2. Reduce bubble vertical padding toward 6px while preserving readable line-height.
3. Ensure code blocks, lists, and proposal artifacts do not visually collapse.
4. Verify scroll anchoring during streaming responses.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaPanel.svelte`

## Acceptance Criteria

- [ ] Message log shows materially more content above the fold at 360px width.
- [ ] Tool chips and proposal artifacts remain visually separate from plain prose.
- [ ] Streaming does not jitter or lose scroll position.

## Edge Cases

- Long markdown blocks should preserve readable spacing even if normal prose bubbles are compact.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
