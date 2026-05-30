---
title: Render Tool Chips and Agent Plan
slug: part-002-render-tool-chips-and-agent-plan
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-005-caps-abort-and-ui-states
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Render Tool Chips and Agent Plan

## Objective

Polish inline tool-call and tool-result rendering so Agent mode is inspectable but not noisy.

## Scope

**In scope:**

- Polish inline tool-call and tool-result rendering so Agent mode is inspectable but not noisy.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Render collapsible tool-call chips with label, status, and duration where available.
2. Render tool-result summary without dumping full payload by default.
3. Optionally render a collapsible `Plan` header in the first assistant message.
4. Ensure proposal artifacts are visibly review-gated.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/*Tool*.svelte`

## Acceptance Criteria

- [ ] Users can see which tools ran and whether they succeeded.
- [ ] Tool payload details are collapsible and do not dominate the conversation.
- [ ] Proposal artifacts are clearly not auto-applied.

## Edge Cases

- Long tool result payloads should summarize and allow expansion, not render thousands of words inline.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
