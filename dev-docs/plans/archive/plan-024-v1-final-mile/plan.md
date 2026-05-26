---
title: V1 Final Mile — DoD Closure & Release Engineering
slug: plan-024-v1-final-mile
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-10
last_updated: 2026-05-26  # closed; non-DoD stages deferred-to-v1.1
target_completion: 2026-05-31
stages:
  - stage-001-dod-verification
  - stage-002-release-engineering
  - stage-003-ollama-and-shortcuts-finish
  - stage-004-light-theme-sweep
  - stage-005-ai-surface-decision
  - stage-006-docs-rebaseline
dependencies:
  - plan-018-v1-product-experience
  - plan-021-reader-pagination
  - plan-019-naming-consistency
quality_gates:
  - lint
  - typecheck
  - tests
  - visual_regression
  - manual_smoke
  - docs_sync
---

## Objective

Close every gap between "shipped code that resembles V1" and a tag-able
`v1.0.0` release. The V1 product plans (017, 018, 020, 022, 023) have all
landed, but the [v1-dod-checklist](../../qa-docs/v1-dod-checklist.md) is
still mostly unsigned: performance, signed installers, packaged-shell
keyring verification, and CI dry-runs have not been formally executed.
This plan turns the checklist into work, finishes a few partially-wired
features that ship "hot but unplugged" (Ollama provider toggle, global
shortcut emitters), re-baselines visual regression after the editor /
Nova / light-theme changes, makes a clear ship-or-cut call on the four
unimplemented runtime agents, and re-baselines documentation against the
state of the tree on 2026-05-10.

This plan does **not** cover reader pagination ([plan-021](../plan-021-reader-pagination/plan.md))
or the naming refactor ([plan-019](../plan-019-naming-consistency/plan.md));
those remain independent draft plans and are listed as dependencies so
the V1 tag waits for them.

## Scope

**In scope:**

- Formal execution of every checkbox in `v1-dod-checklist.md`,
  producing measured evidence (test logs, fixture timings, screenshots).
- Release-engineering tasks listed under `dev-docs/qa-docs/task-06`
  through `task-10` (smoke installer, keyring verify, brand icons,
  signing certs, CI tag dry-run).
- Finishing partially-wired V1 features: Ollama provider toggle in the
  Defaults settings tab, end-to-end `/api/ai` test against the Ollama
  branch, registration of `save-scene` and `view-in-reader` shortcuts
  to the dispatcher shipped in `keyboard/global-handler.ts`.
- Light-theme visual regression sweep (Storybook + Playwright matrix)
  across editor, Nova, reader, settings, and modals.
- One explicit decision on the four "Planned" runtime agents
  ([agents-map.md](../../03-ai/agents-map.md)): ship Outline + Summary
  parsers and Continuity→Rewrite chaining, **or** remove the unused
  TaskTypes from `src/lib/ai/types.ts` so the public surface matches
  reality.
- Documentation re-baseline: `roadmap.md`, `agents-map.md`,
  `beta-program.md`, and `novellum-docs/user/` reflect the
  2026-05-10 tree (Ollama provider, light theme, sidebar store,
  global shortcut bus, migration-precheck robustness).

**Out of scope:**

- Reader pagination engine (plan-021).
- Naming-consistency refactor (plan-019).
- Cloud sync, multi-author, mobile, Scrivener import — explicitly
  post-V1 per `roadmap.md`.
- New AI capabilities beyond the ship-or-cut decision in stage-005.

## Stages

| #   | Stage                                                                                  | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [DoD verification & sign-off](stage-001-dod-verification/stage.md)                     | `in-progress` | 2d            |
| 002 | [Release engineering](stage-002-release-engineering/stage.md)                          | `draft` | 2d            |
| 003 | [Ollama & shortcuts finish](stage-003-ollama-and-shortcuts-finish/stage.md)            | `draft` | 1d            |
| 004 | [Light-theme regression sweep](stage-004-light-theme-sweep/stage.md)                   | `complete` (superseded by plan-026, 2026-05-26) | 1d            |
| 005 | [AI surface ship-or-cut decision](stage-005-ai-surface-decision/stage.md)              | `complete` (superseded by plan-025, 2026-05-26) | 1.5d          |
| 006 | [Documentation re-baseline](stage-006-docs-rebaseline/stage.md)                        | `draft` | 0.5d          |

## Quality Gates

- [ ] **lint** — zero lint errors (`pnpm lint` + `pnpm lint:css`).
- [ ] **typecheck** — zero type errors (`pnpm check`).
- [ ] **tests** — `pnpm test` green excluding `.claude/worktrees/`;
      new coverage for the ollama provider toggle, shortcut emitters,
      and any agent parsers introduced in stage-005.
- [ ] **visual_regression** — Playwright visual matrix re-baselined
      in light + dark for editor, Nova panel (chat & tools), reader,
      settings shell, modals.
- [ ] **manual_smoke** — packaged macOS `.dmg` and Windows `.msi`
      installers complete `task-06-smoke-test-installer` script.
- [ ] **docs_sync** — `roadmap.md`, `agents-map.md`,
      `beta-program.md`, root `AGENTS.md`, and `MASTER-PLAN.md`
      updated; `Last verified` dates rolled forward.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Performance fixture (100ch / 500sc) reveals an actual UI freeze | medium | Time-box stage-001 phase for fixture gen; fall back to virtualization spike under a follow-up plan. |
| Code-signing certificates blocked on vendor onboarding | medium | Start cert acquisition in parallel with stage-001 so the wait is hidden behind other work. |
| `.claude/worktrees/` exclusion changes break someone else's local flow | low | Tighten exclusion only in `vitest.config.ts`; do not delete the directory. |
| Ship-or-cut decision in stage-005 is contentious | low | Document the call in `agents-map.md` with a one-line rationale. Either path is reversible. |
| Light-theme sweep uncovers contrast failures in tokens | medium | Reuse the audit format from `dev-docs/audits/component-inventory.md`; fix tokens, not components. |

## Notes

- The user-visible failures called out in
  [problems-found-001.md](../../qa-docs/user-problems/problems-found-001.md)
  Problems 001–005 are already addressed by plan-020 / 022 / 023; this
  plan does not re-open them. New post-merge findings should land here
  if they affect tag readiness, otherwise file them as a follow-up plan.
- This plan is the canonical "what's left for V1" reference. While it
  is `in-progress`, [`ACTIVE-PLAN.md`](../ACTIVE-PLAN.md) should
  point at it so any agent (Codex CLI, Claude Code, Gemini) resuming
  work picks it up without ambiguity.
