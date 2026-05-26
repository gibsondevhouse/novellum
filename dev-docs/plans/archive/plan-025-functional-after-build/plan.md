---
title: V1 Functional After Build
slug: plan-025-functional-after-build
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-13
last_updated: 2026-05-13
target_completion: 2026-05-13
stages:
  - stage-001-functional-after-build
dependencies:
  - plan-024-v1-final-mile
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - check:tokens
  - smoke:built
---

## Objective

Ensure Novellum V1 is fully functional after `pnpm desktop:build` — no
stubbed surfaces, no broken bundling, no actionable "coming soon"
affordances that go nowhere when a user clicks them in the packaged app.

This plan was scoped after plan-024 landed two packaged-app fixes
(DOMPurify SSR, aiSession re-hydrate) and the smoke harness
(`scripts/smoke-built-server.mjs`). Three Explore subagent passes
catalogued the remaining gaps; this plan executes the resulting fix
list and adds the verification surface needed to prevent regression.

## Scope

**In scope:**

- Replace `process.cwd()` usage in modules that run inside the packaged
  sidecar so writes land in the app-data dir, not next to the binary.
- Verify legal/privacy markdown bundles via `?raw` imports.
- Key the OpenRouter `/api/ai/models` cache by credential hash so
  rotation invalidates naturally.
- Cut the 4 unimplemented AI agents (`BrainstormAgent`, `OutlineAgent`,
  `DraftAgent`, `SummaryAgent`) from the V1 task-resolver surface so
  legacy callers fall back to `continue` instead of failing silently.
- Hide post-V1 actionable stubs (Find & Replace toolbar pill, broken
  "Check for updates" button, locked "Recent sessions" sidebar item,
  Research-mode dropdown, non-Labs Story Bible placeholder).
- Remove development noise (UI-button `console.log`).
- Extend `pnpm smoke:built` from 4 → 7 probes; add CI job; add manual
  smoke checklist for the packaged `.app`.

**Out of scope:**

- Re-introducing any of the cut agents (new feature plan).
- Tauri auto-updater integration.
- Find & Replace, Recent Sessions, Research mode, Story Bible features.

## Stages

| #   | Stage                                                             | Status     | Est. Duration |
| --- | ----------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Functional after build](stage-001-functional-after-build/stage.md) | `complete` | 1d            |

## Quality Gates

- [x] **lint** — zero ESLint errors
- [x] **lint:css** — zero Stylelint errors
- [x] **typecheck** — `pnpm check` clean
- [x] **tests** — 1029/1029 vitest pass
- [x] **check:tokens** — zero hardcoded design values
- [x] **smoke:built** — all 7 built-server probes pass

## Risks & Mitigations

| Risk                                                              | Likelihood | Mitigation                                                                                       |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Cutting agents breaks legacy Nova prompts that asked for them.    | medium     | `task-resolver` falls back to `continue` for unknown TaskTypes; covered by regression test.      |
| Hiding "coming soon" UI surfaces orphans the underlying routes.   | low        | Story Bible route still renders Labs preview when enabled; Updates page links to GitHub releases. |
| `smoke:built` regressing on CI for reasons unrelated to bundling. | low        | Script falls back to system Node when bundled Node isn't fetched; covered locally + CI.          |

## Notes

- Phase A: server-side correctness (process.cwd → resolveAppDataDir, etc.).
- Phase B: cut 4 unimplemented agents.
- Phase C: hide actionable stubs.
- Phase D: console.log hygiene.
- Phase E: extend smoke harness, add manual checklist, wire CI smoke job.
- Phase F: final gate run + commit.

The full implementation log is in
`stage-001-functional-after-build/phase-001-execution/impl.log.md`.
