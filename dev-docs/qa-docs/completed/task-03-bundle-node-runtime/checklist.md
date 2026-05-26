# Task 03 — Checklist

- [-] `scripts/fetch-node.mjs` created
- [?] Script verifies SHA256 against SHASUMS256.txt
- [ ] Script writes `src-tauri/binaries/node-<target-triple>` with
      executable bit set
- [ ] `package.json` `pretauri` / `predesktop:build` hooks wire the
      script
- [ ] `src-tauri/tauri.conf.json` `bundle.externalBin` declares
      `binaries/node`
- [ ] `tauri-plugin-shell` added to `src-tauri/Cargo.toml` and
      registered in `lib.rs`
- [ ] `src-tauri/src/sidecar.rs::resolve_node_binary` uses the
      sidecar binary first, falls back to PATH for dev
- [ ] `.gitignore` ignores `src-tauri/binaries/`
- [ ] Running `node scripts/fetch-node.mjs` produces a binary for
      the host's target triple
- [ ] `cargo check` clean after Rust edits
- [ ] `pnpm run check && lint && test` still green
- [ ] Committed: script, config edits, Rust edits — NOT the
      binaries
