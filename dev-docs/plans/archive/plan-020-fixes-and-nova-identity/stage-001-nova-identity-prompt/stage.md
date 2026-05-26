---
title: Nova Identity Prompt
slug: stage-001-nova-identity-prompt
stage_number: 1
status: complete
owner: AI Agent
plan: plan-020-fixes-and-nova-identity
phases:
  - phase-001-verify-and-close
estimated_duration: 0.25d
risk_level: low
---

## Goal

Confirm that Nova's stable identity block is authored, exported, and prepended to every prompt constructed by `PromptBuilder`. No new code is required — this stage verifies the completed implementation and closes the work.

## Context (already in tree — do not duplicate)

- `src/lib/ai/constants.ts` exports `NOVA_IDENTITY_BLOCK` (line 20–25):
  > "You are Nova, the AI co-author inside Novellum — a creative writing application. Your role is to assist authors with drafting, editing, brainstorming, and narrative development. You operate as a context-aware writing partner with access to the author's current scene, characters, and world-building material."
- `src/lib/ai/prompt-builder.ts` line 93 prepends it:
  `` `## ROLE\n${NOVA_IDENTITY_BLOCK}\n\n${task.role}` ``
- `tests/ai/prompt-builder.test.ts` already contains two assertions:
  1. `expect(prompt).toContain(NOVA_IDENTITY_BLOCK)` — block present.
  2. `expect(identityPos).toBeLessThan(rolePos)` — identity precedes task-specific role text.

## Exit Criteria

- `pnpm run test -- tests/ai/prompt-builder.test.ts` passes (both the `contains` and `ordering` assertions green).
- `pnpm run lint` passes with no boundary violations.
- Stage status updated to `complete` after verification.

## Phases

### Phase-001 — Verify and close

**Goal:** Run the existing test suite against `prompt-builder.test.ts`, confirm both identity assertions pass, and mark the stage complete. No source changes expected.

**Files (read-only verification):**

- `src/lib/ai/constants.ts` — confirm `NOVA_IDENTITY_BLOCK` export is intact.
- `src/lib/ai/prompt-builder.ts` — confirm line 93 prepend expression is unchanged.
- `tests/ai/prompt-builder.test.ts` — confirm both identity assertions exist.

**Acceptance checklist:**

- [ ] `pnpm run test -- tests/ai/prompt-builder.test.ts` exits 0 with all tests passing.
- [ ] `NOVA_IDENTITY_BLOCK` appears in the `## ROLE` section of every `buildPrompt` output (confirmed by test assertion on line 127).
- [ ] Identity block precedes task-specific role text (confirmed by ordering assertion on line 129).
- [ ] `pnpm run lint` — zero boundary errors.
- [ ] Stage status set to `complete` in this file.

## Out of Scope

- Modifying the `NOVA_IDENTITY_BLOCK` content. Any copy changes belong in a separate editorial task.
- Adding new prompt sections or Nova persona features beyond what is already wired.
- Changes to any agent other than the AI pipeline (`src/lib/ai/`).
