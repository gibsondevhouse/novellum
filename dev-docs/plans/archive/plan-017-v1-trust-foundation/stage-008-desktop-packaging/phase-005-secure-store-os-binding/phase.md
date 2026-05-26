---
title: Secure Store OS Binding
slug: phase-005-secure-store-os-binding
phase_number: 5
status: complete
started_at: 2026-04-30
completed_at: 2026-04-30
owner: Planner Agent
stage: stage-008-desktop-packaging
estimated_duration: 1.5d
---

## Goal

Bind the existing `src/lib/server/credentials/secure-store.ts` to
the OS keyring (macOS Keychain, Windows Credential Manager, Linux
libsecret) when running inside the desktop shell. In web mode the
existing in-memory/encrypted-disk fallback continues to work.

## Acceptance Criteria

- [x] OS-keyring backend loaded only in desktop mode. The Tauri
      sidecar spawn (`src-tauri/src/sidecar.rs`) sets
      `NOVELLUM_DESKTOP=1` in the child env;
      `selectSecureStore()` reads that env to choose between
      `createKeyringSecureStore` (µnapi-rs/keyring) and the
      filesystem store.
- [x] Existing BYOK contract preserved — the keyring store
      implements the same `SecureStore` interface; tests inject
      a Map-backed fake keyring factory and exercise the full
      round-trip without a native module.
- [x] Secrets never written to a regular file in desktop mode —
      keyring backend has no filesystem path; the filesystem
      `SecureStore` is bypassed entirely when `NOVELLUM_DESKTOP=1`.
- [x] Boundary lint + svelte-check + test green (594/594).
