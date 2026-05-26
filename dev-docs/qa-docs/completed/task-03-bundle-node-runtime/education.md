# Task 03 — Education

## Why a sidecar binary at all

`better-sqlite3` is a native Node addon. It cannot run inside a
WebView, and rewriting it in Rust would mean re-implementing every
`/api/db/*` route. The simplest path is to keep the SvelteKit
backend as-is and run it as a child process. That child process
needs a Node interpreter.

Three ways to obtain that interpreter:

1. **Use the user's system Node.** Cheap; will not work on most
   end-user machines. (Today's state.)
2. **Bundle the official Node binary.** ~50 MB extra, but
   reproducible, signed by Node Foundation, and trivial to update.
   (This task.)
3. **Compile a custom Node SEA (Single Executable Application).**
   Smaller binary, but native modules like `better-sqlite3` still
   need to be loaded as separate `.node` files alongside the SEA.
   More complex, marginal gain.

Option 2 is the pragmatic V1 choice.

## Tauri's `externalBin` + target triples

When `bundle.externalBin` declares a sidecar like `binaries/node`,
Tauri expects to find one binary **per target triple** the build
runs for. The build picks the matching one based on the host's
target. Triple suffixes:

| Platform              | Suffix                        |
| --------------------- | ----------------------------- |
| macOS Apple Silicon   | `-aarch64-apple-darwin`       |
| macOS Intel           | `-x86_64-apple-darwin`        |
| Windows x64           | `-x86_64-pc-windows-msvc.exe` |
| Linux x64             | `-x86_64-unknown-linux-gnu`   |

So `binaries/node-aarch64-apple-darwin` is what the Rust code asks
for via `app.shell().sidecar("node")` when running on an M-series
Mac. Tauri auto-strips the suffix at runtime.

## Why your script verifies SHA256

You are bundling a third-party binary into your installer. If
`nodejs.org` is compromised or DNS is hijacked, your script could
download a backdoored Node and ship it to every user. Verifying
against `SHASUMS256.txt` (which is itself fetched over HTTPS from
the Node Foundation) closes that supply-chain hole. Cheap insurance.

## Why install only the binary, not the full Node distribution

The official tarball is ~80 MB. The actual `node` binary inside is
~50 MB. The rest is `npm`, `corepack`, headers, docs, manpages —
everything you do not need at runtime. Extracting just the binary
keeps your installer lean.

## Tauri Plugin Shell vs `std::process::Command`

The current `src-tauri/src/sidecar.rs` uses `std::process::Command`
because it predates the bundled-binary plan. Once `externalBin` is
in play, switching to `tauri_plugin_shell::ShellExt::sidecar(...)`
gives you:

- Automatic resolution of the right target-triple suffix.
- Proper sandboxing on macOS.
- Future capability gating in `src-tauri/capabilities/default.json`.

Keep `std::process::Command` as a fallback path for the dev case
where no bundled binary exists and the developer has Node on PATH.
