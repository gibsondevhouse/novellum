# User Problems — Triage Status

> Last triaged: 2026-05-26 (post-V1 ship-gate close).
>
> Source documents:
>
> - [problems-found-001.md](./problems-found-001.md) — first desktop run, 5 problems.
> - [report-02-and-03/problems-found-002.md](./report-02-and-03/problems-found-002.md) — settings sweep, ~8 sub-issues.
> - [problem-report-001.md](./problem-report-001.md), [report-02-and-03/problem-report-002.md](./report-02-and-03/problem-report-002.md), [report-02-and-03/problem-report-003-terminal-launch.md](./report-02-and-03/problem-report-003-terminal-launch.md) — macOS crash reports (raw).

## problems-found-001.md

| # | Problem | Status | Resolved by |
|---|---|---|---|
| 001 | Nova unaware of her identity / Novellum context | **Resolved** | [plan-020 stage-001 Nova identity prompt](../../plans/archive/plan-020-fixes-and-nova-identity/stage-001-nova-identity/stage.md) |
| 002 | Reader: no empty state, no page margins, no page breaks | **Deferred-to-V1.1** | Scoped in [plan-021 (deferred)](../../plans/archive/plan-021-reader-pagination/plan.md) |
| 003 | Editor: needs word-processor surface, Nova copilot panel, view-in-reader | **Resolved** | [plan-023 editor redesign + Nova copilot](../../plans/archive/plan-023-editor-redesign-and-nova-copilot/plan.md) |
| 004 | Settings: needs IA, pill nav, categories | **Resolved** | [plan-022 settings IA](../../plans/archive/plan-022-settings-ia/plan.md) |
| 004a | OpenRouter API key failing to save | **Resolved** | [plan-020 stage-002 key persistence](../../plans/archive/plan-020-fixes-and-nova-identity/stage-002-openrouter-key-persistence/stage.md) |
| 004 curiosity | OpenRouter balance display in settings | **Deferred-to-V1.1** | Nice-to-have; no plan opened. |
| 005 | Project Hub word count incorrect | **Resolved** | [plan-020 stage-003 hub word count](../../plans/archive/plan-020-fixes-and-nova-identity/stage-003-hub-word-count/stage.md) |

## problems-found-002.md (settings sweep)

| Problem | Status | Notes |
|---|---|---|
| App theme switching has no visual effect | **Open — V1.1** | Settings IA shipped but theme toggle wiring still inert. Candidate for plan-027 V1.1 stability sweep. |
| Editor options show no visual change in the editor | **Open — V1.1** | Same V1.1 stability sweep candidate. |
| Default home page changes home button behavior (should only change initial route) | **Open — V1.1** | Real bug. |
| Shortcut buttons do not work | **Open — V1.1** | Plan-024 stage-003 (Ollama & Shortcuts Finish) covers this — deferred. |
| AI key could not be saved (settings sweep) | **Likely resolved** | plan-020 stage-002 fixed key persistence; re-verify against current build. |
| "Lab Features" toggle has no explanation | **Open — V1.1** | Either remove or add help copy. |
| Data tab: "failed to check databases, server may not have started" | **Likely resolved** | plan-025 fixed app-data path inside Tauri sidecar; re-verify against current packaged build. |

## Crash reports

The three `problem-report-*.md` files are raw macOS crash dumps from
pre-plan-025 packaged builds. The `clsx` `ERR_MODULE_NOT_FOUND` in
[problem-report-003-terminal-launch.md](./report-02-and-03/problem-report-003-terminal-launch.md)
was the sidecar app-data path / bundled-deps bug fixed in
[plan-025](../../plans/archive/plan-025-functional-after-build/plan.md).
They are kept as historical evidence; do not re-open against them
without a fresh repro on current master.

## What still needs work

Carry forward into a V1.1 stability sweep (candidate `plan-027`):

1. Settings theme toggle wiring (visible app-theme change).
2. Editor options toggles (line spacing, font size — visible editor change).
3. Default home page vs. home button decoupling.
4. Lab Features toggle — explain or remove.
5. Reader empty state + pagination engine (plan-021 deferred).
6. Shortcut customization (plan-024 stage-003 deferred).
7. OpenRouter balance display (curiosity item).
8. Re-verify "likely resolved" entries above on current master.
