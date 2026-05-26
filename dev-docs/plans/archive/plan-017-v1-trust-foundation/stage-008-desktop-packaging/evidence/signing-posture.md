# Code-Signing & Notarisation Posture

**Date:** 2026-04-30
**Stage:** plan-017 / stage-008-desktop-packaging / phase-004
**Status:** Documented; key procurement deferred to plan-018 stage-010.

## Decision

Stage-008 ships **unsigned** installer artifacts for macOS Apple
Silicon and Windows x64 from CI. Code-signing keys and the
notarisation pipeline are intentionally deferred to plan-018
stage-010 (Release & Update). The build pipeline laid down in
`.github/workflows/desktop-build.yml` is structured so the only
delta when keys arrive is the addition of a `Sign` step and a few
secrets.

## Rationale

- Signing keys (Apple Developer ID and Windows EV / OV) are
  procurement and identity items, not engineering items. Blocking
  stage-008 on them would block the rest of the trust foundation.
- An unsigned artifact still proves the packaging pipeline works
  end-to-end (Cargo build → Tauri bundle → installer). Reviewers
  can run the artifact locally with the OS bypass flow (macOS
  right-click-Open / Windows SmartScreen "Run anyway").
- Plan-018 stage-010 will own the full release pipeline: signing,
  notarisation, auto-updater feed, and the GitHub Release flow.

## Required Inputs (Deferred)

### macOS

- Apple Developer Program membership (\$99/yr).
- Developer ID Application certificate exported as `.p12`,
  base64-encoded, stored in GitHub Secrets as
  `APPLE_CERTIFICATE`.
- `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
  `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` secrets.
- `tauri.conf.json` `bundle.macOS.signingIdentity` set, plus a
  notarisation step using `xcrun notarytool` after `tauri build`.

### Windows

- EV or OV code-signing certificate from a recognised CA
  (DigiCert, Sectigo, etc.).
- `WINDOWS_CERTIFICATE` (`.pfx` base64), `WINDOWS_CERTIFICATE_PASSWORD`
  secrets.
- `tauri.conf.json` `bundle.windows.certificateThumbprint` (or
  `signCommand` for EV cloud signing).

## Empirical Status

Phase-004 lands the metadata, the version-sync script, and the CI
workflow scaffold. The first successful run of `desktop-build.yml`
on `workflow_dispatch` will produce two unsigned artifacts. Once
keys arrive (plan-018 stage-010), the `Sign` step is added between
`Build desktop installer` and `Upload artifact`.

## Out of Scope for This Stage

- Linux `.AppImage` / `.deb` artifacts. Tauri can produce them but
  Linux is not a V1 platform.
- Auto-updater feed. The `tauri-plugin-updater` stub lands in
  phase-006; the actual update server lives in plan-018.
