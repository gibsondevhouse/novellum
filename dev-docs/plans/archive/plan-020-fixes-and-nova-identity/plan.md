---
title: Quick Fixes & Nova Identity
slug: plan-020-fixes-and-nova-identity
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-03
last_updated: 2026-05-06
target_completion: 2026-05-10
stages:
  - stage-001-nova-identity-prompt
  - stage-002-openrouter-key-save-bug
  - stage-003-hub-word-count-bug
  - stage-004-verification
dependencies:
  - plan-019-naming-consistency
quality_gates:
  - lint
  - typecheck
  - tests
  - manual_smoke
---

## Objective

Resolve three small, user-visible defects observed during the first
desktop run ([problems-found-001.md](../../qa-docs/user-problems/problems-found-001.md)) so the
product feels trustworthy on launch:

1. **Nova does not know who she is.** She has no identity prompt
   and is unaware she is the Novellum co-author agent.
2. **OpenRouter API key fails to save** from settings, blocking
   every AI feature for new users.
3. **Hub word count is wrong.** Project hub displays an inaccurate
   running total, undermining the core "writing dashboard" promise.

These are independent bugs but ship together because each is small,
each erodes user trust at first contact, and bundling avoids three
release ceremonies for ~one day of total work.

## Scope

**In scope:**

- Nova's system/role prompt: identity, role, awareness of running
  inside Novellum, awareness of her name, awareness of the
  agentic-co-author framing. Implemented inside the existing
  `PromptBuilder` ROLE block (no new agent).
- OpenRouter key persistence path: trace `Save` action in
  [src/routes/settings/+page.svelte](../../../src/routes/settings/+page.svelte) → `keyring-store` →
  SQLite `secrets` table. Identify whether the regression is in
  the form binding, the API call, or the secure-store layer; fix
  the broken hop.
- Hub word count recomputation: scenes' `wordCount` field
  freshness, where it is sourced from in
  [src/routes/projects/[id]/+page.ts](../../../src/routes/projects/%5Bid%5D/+page.ts), and
  whether autosave updates it.

**Out of scope:**

- OpenRouter balance display (parked in roadmap, see
  [roadmap.md](../../roadmap.md)).
- Settings IA / pill-nav refactor (plan-022).
- Any new Nova capabilities beyond the identity prompt itself
  (plan-023 owns the copilot redesign).

## Stages

| #   | Stage                                                                     | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Nova identity prompt](stage-001-nova-identity-prompt/stage.md)           | `draft` | 0.5d          |
| 002 | [OpenRouter key save bug](stage-002-openrouter-key-save-bug/stage.md)     | `draft` | 0.5d          |
| 003 | [Hub word count bug](stage-003-hub-word-count-bug/stage.md)               | `draft` | 0.5d          |
| 004 | [Verification](stage-004-verification/stage.md)                           | `draft` | 0.25d         |

## Quality Gates

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all Vitest suites pass; new unit tests for each fix
- [ ] **manual_smoke** — Nova answers "who are you" correctly; new
      user can paste OpenRouter key and see it persist across
      app restart; hub word count matches sum of `wordCount` across
      scenes after editing one scene

## Risks & Mitigations

| Risk                                                                | Likelihood | Mitigation                                                                                |
| ------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Key save bug is in the OS keychain layer, not our code              | low        | Diagnose with logging first; if Tauri keychain layer is the cause, document and fall back |
| `wordCount` is computed client-side and never persisted             | medium     | If true, add to autosave write path; covered by the dedicated phase in stage-003          |
| Nova prompt change subtly breaks an existing AI agent's tone/output | low        | Identity copy is appended to ROLE block, not TASK; existing prompt-builder tests guard    |
