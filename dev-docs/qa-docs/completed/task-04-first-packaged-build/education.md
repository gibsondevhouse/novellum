# Task 04 — Education

## What `pnpm desktop:build` actually does

The `desktop:build` script in `package.json` simply invokes
`tauri build`. The full pipeline:

```text
predesktop:build           ── sync version + fetch bundled Node (post-Task-03)
   │
   ▼
beforeBuildCommand         ── pnpm build && node scripts/prepare-sidecar-deps.mjs
   │   pnpm build  → SvelteKit + Vite production build (build/index.js,
   │                build/client/*, build/server/*)
   │   prepare-sidecar-deps  → stages native runtime deps under
   │                build/node_modules/ so the bundled-Node sidecar
   │                resolves them against the right ABI
   │
   ▼
cargo build --release      ── compiles src-tauri/ in release mode
   │   produces: src-tauri/target/release/novellum (raw binary)
   │
   ▼
tauri bundler              ── wraps everything per tauri.conf.json#bundle
   │
   ▼
.dmg / .msi / .AppImage
```

## What's inside a packaged macOS `.app`

Tauri produces a standard macOS app bundle:

```text
Novellum.app/
└── Contents/
    ├── Info.plist              ← bundle metadata, sourced from tauri.conf.json
    ├── MacOS/
    │   ├── novellum            ← the Rust binary (your tauri::run() entry)
    │   └── node-aarch64-apple-darwin   ← Tauri sidecar (Task 03)
    └── Resources/
        ├── icon.icns           ← from src-tauri/icons/icon.icns
        └── _up_/build/         ← the bundled SvelteKit server
            ├── index.js
            ├── handler.js
            └── ...
```

The `_up_` prefix is a Tauri convention: any `bundle.resources` glob
that escapes `src-tauri/` (like `../build/**/*`) gets that prefix to
disambiguate from resources that live inside `src-tauri/`. The Rust
code in `sidecar.rs::resolve_server_entry` knows about this prefix.

## Why first build is so slow

`cargo build --release` recompiles the entire Rust dependency tree
in release mode (with optimisations). Tauri pulls in:

- `tao` (windowing)
- `wry` (WebView wrapper)
- `tokio` (async runtime)
- `serde`, `serde_json`
- ~300 transitive crates

A clean release build on an M-series Mac takes 5–10 minutes; on
Windows in CI, 10–20 minutes. After the first build, Cargo's
incremental cache reuses object files — subsequent rebuilds of just
your code are ~30 seconds.

## Why you don't see the sidecar in `tauri dev`

Compare the two branches in `src-tauri/src/lib.rs`:

```rust
if cfg!(debug_assertions) {
    app.manage(SidecarState(Mutex::new(None)));
    return Ok(());
}

// release-only:
let sidecar = Sidecar::spawn(&handle)?;
window.navigate(sidecar.url())?;
```

`debug_assertions` is on by default in `cargo build` (debug profile)
and off by default in `cargo build --release`. So:

- `tauri dev` (debug profile) → no sidecar; Vite's :5173 takes over.
- `tauri build` (release profile) → sidecar runs; Vite is gone.

This is why **Task 04 is the first time the sidecar code actually
runs in your hands**. Bugs in `sidecar.rs` will surface here, not in
`tauri dev`.

## What an "unsigned" build means

The `.dmg` / `.app` is functional but lacks Apple's notarisation
stamp. macOS Gatekeeper enforces this on first launch — the user
must right-click → Open the first time. Once the system records
they accepted the bundle, future launches work normally.

For CI artifacts and your own dev testing this is fine. For real
users it is unacceptable: most will see "Novellum is damaged and
can't be opened" and assume the app is broken. Task 09 (signing)
removes this friction.
