---
title: Update AI Pipeline Docs
slug: part-002-update-ai-pipeline-docs
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-docs-sync
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Update AI Pipeline Docs

## Objective

Update AI pipeline docs with Agent mode resolver, tool loop, attachment scope, and proposal-envelope behavior.

## Scope

**In scope:**

- Update AI pipeline docs with Agent mode resolver, tool loop, attachment scope, and proposal-envelope behavior.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Document mode-to-resolver routing.
2. Document `user-attached` context scope.
3. Document Agent loop sequence, max-step cap, abort, and tool-result feed-back.
4. Document OpenRouter-only constraint and server-side key boundary.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/03-ai/pipeline.md`
- `dev-docs/04-modules/nova.md`

## Acceptance Criteria

- [ ] Pipeline docs describe the real implemented flow.
- [ ] Tool-calling docs include guardrails and source-contract testing.
- [ ] No direct provider SDK or client-key behavior is documented or implied.

## Edge Cases

- If implementation uses a temporary compatibility adapter, docs must call it temporary and bounded.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
