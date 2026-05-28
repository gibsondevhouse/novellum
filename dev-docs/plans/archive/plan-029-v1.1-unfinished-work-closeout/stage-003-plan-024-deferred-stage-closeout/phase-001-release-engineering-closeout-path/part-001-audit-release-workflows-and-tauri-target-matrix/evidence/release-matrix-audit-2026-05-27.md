# Release Workflow and Tauri Target Matrix Audit

> Generated: 2026-05-27

## Workflows

### release.yml
- **Triggers:** tag push (`v*.*.*`), workflow_dispatch (dry_run)
- **Jobs:**
  - `validate`: lint, check, lint:css, test, web build (ubuntu-22.04)
  - `build-tauri`: 3-platform matrix (macOS universal, Windows, Ubuntu) — only runs on tag push
- **Signing:** `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` via GitHub secrets
- **Missing:** Apple Developer ID notarization, Windows Authenticode signing
- **Output:** Draft GitHub release with DMG/MSI/DEB attached

### desktop-build.yml
- **Triggers:** workflow_dispatch, tag push (`desktop-v*`)
- **Targets:** macOS aarch64 DMG, Windows x64 MSI
- **Comment:** "Code-signing/notarisation is plan-018 stage-010 work — deferred"
- **Missing:** Same signing gaps as release.yml

## Tauri bundle config (tauri.conf.json)
- Configured for DMG, MSI bundle targets
- Uses default Tauri icon set (no custom brand artwork)

## Deferred Commitment Delta

| plan-024 stage-002 Task | Current State | Delta |
|------------------------|---------------|-------|
| task-06 smoke installer | desktop-build.yml produces artifacts; no formal smoke record | **pending** — need packaged launch verification |
| task-07 keyring verify | BYOK key round-trip not formally tested in packaged shell | **pending** |
| task-08 brand icons | Default Tauri icons in src-tauri/icons/ | **pending** — need brand artwork |
| task-09 signing certs | Tauri signing keys exist; no Apple/Windows code-signing | **pending** — external dependency |
| task-10 CI tag dry-run | release.yml has dry_run input; no evidence of successful run | **pending** |
