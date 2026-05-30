---
title: Normalize Missing Density Tokens
slug: part-002-normalize-missing-density-tokens
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-density-audit-and-token-baseline
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 002 — Normalize Missing Density Tokens

## Objective

Fix token gaps required by the compact shell, including undefined spacing or sizing tokens that currently force ad hoc styling.

## Scope

**In scope:**

- Fix token gaps required by the compact shell, including undefined spacing or sizing tokens that currently force ad hoc styling.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Audit Nova component styles for direct pixel values and undefined token references.
2. Add or correct compact tokens, including `--size-dot-small` and any required replacement for undefined `--space-7`.
3. Keep values semantically named and reusable; do not create Nova-only one-off tokens unless no shared semantic exists.
4. Run token validation and record output.

## Files

**Create:**

- None expected.

**Update:**

- `src/styles/tokens.css`
- `tests/tokens/*`
- `scripts/*token*`

## Acceptance Criteria

- [ ] `pnpm check:tokens` passes.
- [ ] Nova compact layout can reference tokens instead of hard-coded pixel values.
- [ ] No brand colors or global palette decisions are changed.

## Edge Cases

- If an undefined token is used outside Nova, fix the shared token contract without visually refactoring unrelated modules.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
