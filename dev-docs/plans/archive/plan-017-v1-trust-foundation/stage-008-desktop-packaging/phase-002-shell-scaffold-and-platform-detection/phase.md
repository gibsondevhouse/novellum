---
title: Shell Scaffold and Platform Detection
slug: phase-002-shell-scaffold-and-platform-detection
phase_number: 2
status: complete
started_at: 2026-04-30
completed_at: 2026-04-30
owner: Planner Agent
stage: stage-008-desktop-packaging
estimated_duration: 1.5d
---

## Goal

Land the chosen shell (Tauri or Electron per phase-001) plus the
`src/lib/platform/platform.ts` detector and the `src/lib/desktop/*`
abstraction. After this phase the editor route can ask "are we
running in the desktop shell?" and call file/dialog/keyring helpers
without coupling to the shell directly.

## Acceptance Criteria

- [x] Shell scaffold present (`src-tauri/`).
- [x] `src/lib/platform/platform.ts` exposes `getPlatform(): 'web' | 'dev' | 'desktop'`.
- [x] `src/lib/desktop/index.ts` re-exports a stable surface that
      no-ops on web. Tauri-bound implementation lazy-loaded so the
      web bundle never imports `@tauri-apps/api`.
- [x] `pnpm desktop:dev` script wired (`tauri dev`). Empirical boot
      measurement deferred to phase-003 once the sidecar lands.
- [x] Boundary lint + svelte-check + test green (584/584).
