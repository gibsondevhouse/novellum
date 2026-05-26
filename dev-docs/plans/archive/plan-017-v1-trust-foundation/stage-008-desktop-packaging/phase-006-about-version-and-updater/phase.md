---
title: About Version and Updater
slug: phase-006-about-version-and-updater
phase_number: 6
status: complete
started_at: 2026-04-30
completed_at: 2026-04-30
owner: Planner Agent
stage: stage-008-desktop-packaging
estimated_duration: 1d
---

## Goal

Expose the running version to the UI via `src/lib/version.ts` and
land a *stub* auto-updater wired to the chosen shell's update API.
Real release/update pipeline lives in plan-018 stage-010; this
phase only proves the surface area exists.

## Acceptance Criteria

- [x] `src/lib/version.ts` now sources `APP_VERSION` from
      `package.json#version` via a JSON import. `getAppVersion()`
      accessor added for new call sites. The npm version, the
      desktop installer version (synced via
      `scripts/sync-tauri-version.mjs`), and the runtime constant
      can no longer drift.
- [x] Updater stub registered: `src/lib/desktop/updater.ts`
      exports `checkForUpdates()` returning `'none'` on web and
      `'unsupported'` on desktop until plan-018 stage-010 wires
      `tauri-plugin-updater`. `applyUpdate()` throws a controlled
      error.
- [x] Settings → About surface ready for plan-018 to consume.
      `getAppVersion()` + `checkForUpdates()` re-exported from
      `$lib/desktop`.
- [x] Stage-008 closes; plan-017 stage row flips to complete;
      plan master roll-up updated.
