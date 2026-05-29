---
title: Replace Chat/Scribe Types
slug: part-001-replace-chat-scribe-types
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-001-mode-type-and-session-state
started_at: 2026-05-28
completed_at: 2026-05-28
estimated_duration: 0.25d
---

# Part 001 — Replace Chat/Scribe Types

## Objective

Introduce the canonical `NovaMode` union and remove or migrate old `chat | scribe` references.

## Scope

**In scope:**

- Introduce the canonical `NovaMode` union and remove or migrate old `chat | scribe` references.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Add `NovaMode = 'ask' | 'write' | 'agent'` to Nova types.
2. Search for old mode literals and replace with explicit mappings.
3. Keep compatibility adapters local to this migration; do not preserve old UI language.
4. Run typecheck and record failures before fixing downstream callers.

## Files

**Create:**

- None expected.

**Update:**

- `src/modules/nova/types.ts`
- `src/modules/nova/**/*.ts`
- `src/modules/nova/**/*.svelte`

## Acceptance Criteria

- [x] No user-facing Chat/Scribe mode labels remain in Nova UI.
- [x] TypeScript catches invalid mode literals.
- [x] All mode callsites use the canonical `NovaMode` type or an explicit migration adapter.

## Edge Cases

- Historical persisted sessions with old mode values should fall back to Ask, not crash.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
