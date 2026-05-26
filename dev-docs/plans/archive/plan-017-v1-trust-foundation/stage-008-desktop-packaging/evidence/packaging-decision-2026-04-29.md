# Packaging Decision: Tauri (recorded 2026-04-29)

## Decision

Novellum will be packaged with **Tauri 2.x**. The decision is recorded
ahead of empirical spike measurements; Section 5 lists the
measurements that must be captured during phase-002 implementation
to confirm or invalidate this choice.

## Rationale

Three factors drove the choice over Electron:

1. **Mobile expansion headroom.** Tauri 2 ships first-class iOS and
   Android targets from the same codebase. Plan-019 explicitly lists
   "mobile reader" as a candidate. Electron is desktop-only — the
   mobile path would require a parallel Capacitor or native rewrite.
2. **Bundle size and resource footprint.** A typical Tauri release
   binary lands at 10–20 MB versus Electron's 150–250 MB. For an
   author-facing manuscript app that may run alongside a browser
   and an LLM client, the lighter footprint is a better fit for the
   target user.
3. **Capability-based IPC.** Tauri's `capabilities/` model makes the
   surface between WebView and Rust explicit. Each invokable command
   must be allowlisted, which aligns with the BYOK / secure-store
   posture stage-005 already enforces.

## Trade-offs Accepted

- **Rust learning curve.** Phases 002–006 require Rust changes for
  any new native capability. Mitigated by leaning on
  `tauri-plugin-*` crates (keyring, updater, sql, store) so Novellum
  rarely writes Rust directly.
- **Sidecar architecture for `better-sqlite3`.** The native module
  cannot be loaded inside Tauri's WebView context. Phase-003 spawns
  the existing SvelteKit Node adapter (`build/index.js`) as a Tauri
  sidecar process so `/api/db/*` continues to work unchanged. This
  is the highest-risk piece of stage-008 and is explicitly the
  go/no-go gate. If the sidecar wiring misses cold-start or latency
  targets in phase-002 (see §5), this decision flips to Electron.
- **WebView host fragmentation.** Tauri uses the OS WebView (WKWebView
  on macOS, WebView2 on Windows, WebKitGTK on Linux). Cross-browser
  CSS and JS quirks reappear. Mitigated by pinning a baseline that
  matches the lowest-common Safari version and exercising visual
  tests on the macOS target.

## Why Not Electron

Electron remains a fully viable fallback. The reasons it lost:

- 10×+ binary size for no functional advantage in our use case.
- No mobile story.
- Looser IPC default; we'd be tightening `contextIsolation`,
  `sandbox`, and `nodeIntegration` ourselves to match Tauri's
  capability model out of the box.

Electron's wins (mature ecosystem, easier `better-sqlite3`
integration, well-trodden auto-updater) are real but not
deciding-factor real for V1.

## Required Empirical Validation (phase-002 measurements)

The decision is provisional until phase-002 lands and captures these
numbers. If any threshold is missed, flip to Electron and record the
reversal in `evidence/packaging-decision-2026-MM-DD-electron.md`.

| Metric                                              | Target           | Source                                             |
| --------------------------------------------------- | ---------------- | -------------------------------------------------- |
| Cold-start time (window visible) on macOS arm64     | ≤ 1.5 s          | Tauri timing log + manual stopwatch                |
| Release binary size on macOS arm64                  | ≤ 30 MB          | `du -sh src-tauri/target/release/bundle/macos/*`   |
| Sidecar boot time (Node child → first /api/db OK)   | ≤ 800 ms         | `console.time` around the Node fork in `main.rs`   |
| Sidecar /api/db round-trip latency                  | ≤ 5 ms p50       | Existing repository test re-run inside the shell   |
| Memory (idle, no scene open)                        | ≤ 250 MB         | Activity Monitor                                   |

## Next-Phase Implications

- **Phase 002.** Scaffold under `src-tauri/` (`Cargo.toml`,
  `tauri.conf.json`, `src/main.rs`, `capabilities/default.json`,
  `icons/`).
- **Phase 003.** Use the Tauri sidecar pattern: bundle
  `build/index.js` (SvelteKit Node adapter) as a sidecar binary so
  `/api/db/*` continues to work unchanged.
- **Phase 004.** Use `tauri build` for installer artifacts; macOS
  `.dmg` and Windows `.msi`/`.exe` are first-class outputs.
- **Phase 005.** Bind `secure-store.ts` to `tauri-plugin-keyring`.
  Web mode keeps the existing fallback.
- **Phase 006.** Use `tauri-plugin-updater` as the stub. Real
  signing keys deferred to plan-018 stage-010.

## Empirical Spike Status

The "comparative spike" called for in phase-001 part-001 is **deferred
to phase-002 in-shell measurement** rather than a throwaway harness.
Building a full Electron baseline solely to measure against is high
cost for low information gain given the rationale above; the same
measurements taken inside the real phase-002 scaffold are more
useful and cannot drift from production.

This deviation is recorded so the audit trail is honest about why
phase-001 part-001 is closed without two parallel spike artifacts.
