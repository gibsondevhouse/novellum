---
title: Installer Icons and Metadata
slug: phase-004-installer-icons-metadata
phase_number: 4
status: complete
started_at: 2026-04-30
completed_at: 2026-04-30
owner: Planner Agent
stage: stage-008-desktop-packaging
estimated_duration: 1d
---

## Goal

Produce signed-ready installers for macOS Apple Silicon and Windows
11 with proper icons, app name, bundle ID, and version metadata.

## Acceptance Criteria

- [x] Icons present for all required sizes (mac `.icns`, win `.ico`,
      png ladder). Defaults from `tauri init` populate every slot;
      Novellum branding swap is a follow-up asset task.
- [x] App name, bundle ID, version, copyright wired from a single
      source: `package.json#version` propagates to
      `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml` via
      `scripts/sync-tauri-version.mjs` (run as `pnpm version:sync`
      and as a `predesktop:build` hook).
- [x] CI job produces installer artifacts for macOS arm64 and
      Windows x64: `.github/workflows/desktop-build.yml` runs on
      `workflow_dispatch` and on `desktop-v*` tag pushes, building
      `.dmg` and `.msi` artifacts and uploading them.
- [x] Code-signing posture documented in
      `evidence/signing-posture.md` (deferred to plan-018 stage-010
      with explicit secret/cert checklist).
