---
title: Sidecar or Embedded Backend
slug: phase-003-sidecar-or-embedded-backend
phase_number: 3
status: in-progress
started_at: 2026-04-30
owner: Planner Agent
stage: stage-008-desktop-packaging
estimated_duration: 1.5d
---

## Goal

Stand up the SvelteKit Node adapter (with `better-sqlite3`) inside
the chosen shell so `/api/db/*` works in the packaged app exactly as
it does in dev. Tauri path: Node sidecar managed by tauri commands.
Electron path: `child_process.fork` of `build/index.js`.

## Acceptance Criteria

- [x] `src-tauri/src/sidecar.rs` implements port allocation,
      child-process spawning, readiness polling (TCP connect with
      15s timeout), and `Drop`-based teardown.
- [x] `src-tauri/src/lib.rs` setup hook spawns the sidecar in
      release builds and navigates the main webview to the
      sidecar URL. Dev builds skip the sidecar (Vite dev server
      already serves SvelteKit's API routes).
- [x] `RunEvent::ExitRequested` / `RunEvent::Exit` drops the
      sidecar state, killing the child Node process. No orphan
      processes after quit.
- [x] `tauri.conf.json` bundles `../build/**/*` as a Tauri
      resource so `build/index.js` is reachable in packaged
      builds via `app.path().resource_dir()`.
- [x] `cargo check` clean; `pnpm run check && lint && test`
      green at 584/584.
- [ ] **Deferred to phase-003 follow-up:** ship a bundled Node
      runtime (`scripts/fetch-node.mjs` + `bundle.externalBin`)
      so end users do not need Node on PATH. Today the sidecar
      uses `node` from PATH, which is fine for the empirical
      spike but unacceptable for shipped installers.
- [ ] **Deferred:** `pnpm desktop:build` + capture measurements
      (cold-start, sidecar boot, /api/db p50, idle memory,
      release binary size) into
      `evidence/measurements-2026-MM-DD.md`. The first
      `tauri build` pulls multi-GB Cargo crates and benefits
      from human supervision.
- [ ] **Deferred:** smoke test (create project, write scene,
      quit, relaunch, data persists) lands once the bundled
      Node + first packaged build are in place.
