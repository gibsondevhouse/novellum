---
title: Desktop Packaging
slug: stage-008-desktop-packaging
stage_number: 8
status: complete
started_at: 2026-04-29
completed_at: 2026-04-30
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-packaging-decision-and-spike
  - phase-002-shell-scaffold-and-platform-detection
  - phase-003-sidecar-or-embedded-backend
  - phase-004-installer-icons-metadata
  - phase-005-secure-store-os-binding
  - phase-006-about-version-and-updater
estimated_duration: 8d
risk_level: high
---

## Goal

Package Novellum as a real installable desktop app. Decision: **Tauri preferred** (research §3); Electron is a documented fallback if Rust/sidecar effort blocks delivery. The end user must never see Node, pnpm, Vite, or `localhost`.

## Phases

> Suggested decomposition:
>
> - phase-001-packaging-decision-and-spike
> - phase-002-shell-scaffold-and-platform-detection
> - phase-003-sidecar-or-embedded-backend
> - phase-004-installer-icons-metadata
> - phase-005-secure-store-os-binding
> - phase-006-about-version-and-updater

## Entry Criteria

- Stages 001–006 complete. Stage 007 may run in parallel from phase-002 onward.
- Tauri-vs-Electron decision recorded in this stage's evidence with measured spike results (binary size, sidecar complexity, signing posture, `better-sqlite3` integration).

## Exit Criteria

- A documented packaging decision lives in `evidence/packaging-decision-2026-MM-DD.md`.
- Tauri (or Electron) scaffold present:
  - **Tauri path:** `src-tauri/{tauri.conf.json, Cargo.toml, src/main.rs, capabilities/default.json, icons/*}`.
  - **Electron path:** equivalent `electron/` + `electron-builder` config.
- `src/lib/platform/platform.ts` detects `web | dev | desktop` and gates desktop-only behavior.
- `src/lib/desktop/*` exposes a frontend-friendly abstraction (file dialogs, open-data-folder, OS keyring access).
- `src/lib/server/credentials/secure-store.ts` is bound to the OS keyring in desktop mode.
- DB path resolver (Stage 006) returns the desktop path inside the packaged app.
- `package.json` adds: `desktop:dev`, `desktop:build`, `desktop:preview`, `release:local`.
- `svelte.config.js` and `vite.config.ts` are configured for the chosen packaging mode.
- App displays version/about (sourced from `src/lib/version.ts`) in Settings → About (UI shipped in plan-018 stage-004; this stage only exposes the API).
- Installer artifacts produced for at least macOS Apple Silicon and Windows 11 in CI.
- Code-signing/notarization posture documented (signing keys may be deferred to release stage in plan-018, but the build pipeline must be ready to sign).
- Acceptance scenario passes: download installer → install → launch → no terminal/Node/pnpm/localhost visible → create project → reopen app → data persists at the resolved app-data path.

## Notes

- Source: [market-readiness-pt1.md §3](../../research/market-readiness-pt1.md).
- `better-sqlite3` is native and platform-specific. The packaging spike must prove it can be loaded inside the chosen shell — either via a Node sidecar (Tauri) or directly (Electron).
- Auto-updater wiring is permitted to be a stub if it can be safely no-op'd in V1; plan-018 stage-010 finalizes the release/update pipeline.
- `.gitignore` updated to ignore generated Tauri/Electron build outputs but not committed config.
