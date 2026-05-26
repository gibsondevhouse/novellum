---
title: Release Engineering
slug: stage-002-release-engineering
stage_number: 2
status: deferred-to-v1.1
owner: Backend Agent
plan: plan-024-v1-final-mile
phases: []
estimated_duration: 2d
risk_level: medium
---

## Goal

Make the desktop installers safe and reproducible. Closes the
five open release tasks under `dev-docs/qa-docs/`:

- `task-06-smoke-test-installer/` — packaged macOS `.dmg` and
  Windows `.msi` complete the smoke script on a clean VM.
- `task-07-verify-keyring/` — BYOK key round-trips through
  macOS Keychain, Windows Credential Manager, and Linux
  Secret Service from inside the packaged shell.
- `task-08-brand-icons/` — replace placeholder Tauri icons in
  `src-tauri/icons/` with the final brand set across all sizes
  the bundler requires.
- `task-09-signing-certs/` — Apple Developer ID and Windows
  Authenticode certificates acquired, stored as repo secrets,
  and wired into `release.yml`.
- `task-10-ci-and-tag/` — `release.yml` validate+build dry-run
  succeeds end-to-end on a throwaway tag.

## Entry Criteria

- Stage-001 phase that generates the `large-novel` fixture is
  complete (smoke script can use it).
- `ci.yml` is green on `master`.

## Exit Criteria

- Each of the five `task-NN-*` directories contains a
  completion record in `impl.log.md` and the corresponding
  artifacts under `evidence/`.
- `vitest.config.ts` excludes `.claude/worktrees/**` so the
  source test run is free of phantom failures.
- A throwaway `v1.0.0-rc.0` tag has been pushed, signed
  installers built, and removed; the run is reproducible.

## Notes

- Code-signing onboarding can stall on vendor-side checks. Start
  the cert acquisition phase in parallel with everything else in
  this plan.
- Do **not** publish the throwaway tag's installers anywhere —
  it exists only to validate the pipeline.
