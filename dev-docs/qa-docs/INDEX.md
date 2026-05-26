# QA Docs — V1 Shipped, V1.1 Backlog

> Reorganized 2026-05-26 after V1 ship-gate closeout (47/47 DoD).
> Original "plan-017 human dev tasks" framing archived below.

## What's in here

| Artifact | Purpose | Status |
| --- | --- | --- |
| [v1-dod-checklist.md](./v1-dod-checklist.md) | The 47-item V1 Definition-of-Done. | ✅ **47/47 closed 2026-05-26.** |
| [manual-smoke-checklist-v1.md](./manual-smoke-checklist-v1.md) | Human smoke test for packaged builds. 7-probe automated harness wired into CI via [plan-025](../plans/archive/plan-025-functional-after-build/plan.md). | Active — run before every tag. |
| [performance-indexes.md](./performance-indexes.md) | SQLite index inventory + EXPLAIN traces. | Reference. |
| [v1.1-release-engineering/](./v1.1-release-engineering/) | Human-required release tasks 06–10 (smoke, keyring, icons, certs, CI/tag). | **Deferred-to-V1.1** — maps to [plan-024 stage-002](../plans/archive/plan-024-v1-final-mile/stage-002-release-engineering/stage.md). |
| [user-problems/](./user-problems/) | Raw user reports + [STATUS.md](./user-problems/STATUS.md) triage. | Mixed — most resolved; remaining items feed V1.1 stability sweep. |
| [completed/](./completed/) | Historical evidence from plan-017 tasks 01–05. | Archive. |

## V1 ship gate — closed 2026-05-26

- 47/47 DoD items signed. Evidence: [plan-024 stage-001 phase-001](../plans/archive/plan-024-v1-final-mile/stage-001-dod-verification/phase-001-static-inventory/evidence/).
- CI workflows green: `ci.yml`, `visual-tests.yml`, `release.yml` (workflow_dispatch dry-run).
- 11 plans archived in the closeout sweep. See [MASTER-PLAN.md](../plans/MASTER-PLAN.md).

## V1.1 backlog — for the next planning round

The qa-docs side of the V1.1 backlog:

1. **Release engineering** — [v1.1-release-engineering/](./v1.1-release-engineering/). Signing certs procurement (1–4 weeks), then tag + ship.
2. **Stability sweep** — see [user-problems/STATUS.md § What still needs work](./user-problems/STATUS.md#what-still-needs-work). Theme toggle wiring, editor options visual response, default-home-page semantics, Lab Features explanation, reader empty state, shortcut customization.
3. **Documentation re-baseline** — [plan-024 stage-006 deferred](../plans/archive/plan-024-v1-final-mile/stage-006-docs-rebaseline/stage.md).
4. **Ollama & global shortcuts finish** — [plan-024 stage-003 deferred](../plans/archive/plan-024-v1-final-mile/stage-003-ollama-and-shortcuts-finish/stage.md).
5. **Reader pagination engine** — [plan-021 deferred](../plans/archive/plan-021-reader-pagination/plan.md).
6. **Codebase naming consistency** — [plan-019 deferred](../plans/archive/plan-019-naming-consistency/plan.md).

## Original plan-017 task ledger (historical)

| #   | Task                        | Status                                                          |
| --- | --------------------------- | --------------------------------------------------------------- |
| 01  | Verify Toolchain            | ✅ Done. See [completed/task-01-verify-toolchain/](./completed/task-01-verify-toolchain/). |
| 02  | First Dev Run               | ✅ Done. See [completed/task-02-first-dev-run/](./completed/task-02-first-dev-run/). |
| 03  | Bundle Node Runtime         | ✅ Done. See [completed/task-03-bundle-node-runtime/](./completed/task-03-bundle-node-runtime/). |
| 04  | First Packaged Build        | ✅ Done. See [completed/task-04-first-packaged-build/](./completed/task-04-first-packaged-build/). |
| 05  | Capture Measurements        | ✅ Done. See [completed/task-05-capture-measurements/](./completed/task-05-capture-measurements/). |
| 06  | Smoke Test Installer        | ⏳ **V1.1** — see [v1.1-release-engineering/task-06-smoke-test-installer/](./v1.1-release-engineering/task-06-smoke-test-installer/). |
| 07  | Verify Keyring              | ⏳ **V1.1** — see [v1.1-release-engineering/task-07-verify-keyring/](./v1.1-release-engineering/task-07-verify-keyring/). |
| 08  | Brand Icons                 | ⏳ **V1.1** — see [v1.1-release-engineering/task-08-brand-icons/](./v1.1-release-engineering/task-08-brand-icons/). |
| 09  | Signing Certs               | ⏳ **V1.1** — see [v1.1-release-engineering/task-09-signing-certs/](./v1.1-release-engineering/task-09-signing-certs/). |
| 10  | CI + Tag First Release      | ⏳ **V1.1** — see [v1.1-release-engineering/task-10-ci-and-tag/](./v1.1-release-engineering/task-10-ci-and-tag/). |

## Conventions

- Commands run from the repo root unless explicitly noted.
- "Sidecar" = the SvelteKit Node server bundled inside the Tauri shell. Source: [src-tauri/src/sidecar.rs](../../src-tauri/src/sidecar.rs).
- "WebView" = the OS-provided browser surface Tauri uses (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux).
- All `pnpm desktop:*` scripts are wired in [package.json](../../package.json).
