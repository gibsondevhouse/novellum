# Deployment & Release Guide

This guide covers building the Novellum web bundle, building the Tauri desktop installers, versioning, and code-signing.

---

## Prerequisites

In addition to the standard development prerequisites (Node.js 20+, pnpm 9+), desktop builds require:

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Ubuntu / Debian Linux (CI only):**
```sh
sudo apt-get install -y libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev
```

**Windows:**
- Visual Studio Build Tools 2022 with the "Desktop development with C++" workload
- WebView2 Runtime (included with Windows 11; install separately on Windows 10)

Install the Rust toolchain (all platforms):
```sh
rustup update stable
```

---

## Step 1: Sync the Version

Before any build, run the version sync script to ensure `package.json` and `src-tauri/tauri.conf.json` are in sync. Mismatched versions cause the Tauri updater to behave incorrectly.

```sh
pnpm run version:sync
```

This script reads the `"version"` field from `package.json` and writes it to the `version` field in `src-tauri/tauri.conf.json`.

---

## Step 2: Build the Web Bundle

Build the SvelteKit production bundle:

```sh
pnpm run build
```

Output is written to `build/`. This step must succeed before any Tauri desktop build. The Tauri build process reads from `build/` as its web asset source.

---

## Step 3: Desktop Build

Use the `desktop:build` command to build the Tauri desktop app. This command automatically runs `version:sync` and `fetch:node` as pre-build steps:

```sh
pnpm run desktop:build
```

This is equivalent to:
```sh
pnpm run version:sync && pnpm run fetch:node && pnpm tauri build
```

### Cross-Compilation Targets

To build for a specific platform target:

```sh
pnpm tauri build --target aarch64-apple-darwin      # macOS Apple Silicon
pnpm tauri build --target x86_64-pc-windows-msvc    # Windows x64
pnpm tauri build --target x86_64-unknown-linux-gnu  # Linux x64 (CI only)
```

Note: cross-compilation between platforms (e.g., building a Windows binary from macOS) is not supported by Tauri without a CI matrix. Platform-specific builds are handled by the CI pipeline.

---

## Fetching the Node.js Sidecar

Novellum bundles a sidecar Node.js binary to run the SvelteKit server inside Tauri. The `fetch:node` script downloads the correct binary for the current platform and places it in `src-tauri/binaries/`:

```sh
pnpm run fetch:node
```

This is run automatically by `desktop:build`. Only run it manually if you need to refresh the sidecar binary without a full build.

---

## Code Signing

Signed builds require two environment variables:

| Variable | Description |
| :--- | :--- |
| `TAURI_PRIVATE_KEY` | Base64-encoded private key for Tauri's updater signing |
| `TAURI_KEY_PASSWORD` | Passphrase for the private key |

To generate a new signing keypair:

```sh
pnpm tauri signer generate
```

Store the output securely. In the CI environment, these are provisioned as encrypted repository secrets. See stage-010 for the CI/CD pipeline configuration.

Unsigned builds (for development and testing) work without these variables.

---

## Supported Release Targets

| Target triple | Platform | Notes |
| :--- | :--- | :--- |
| `aarch64-apple-darwin` | macOS Apple Silicon | Primary macOS release target |
| `x86_64-apple-darwin` | macOS Intel | Secondary macOS target (universal binary via lipo) |
| `x86_64-pc-windows-msvc` | Windows x64 | Primary Windows release target |
| `x86_64-unknown-linux-gnu` | Linux x64 | CI only; not officially supported |

---

## CI Build Pipeline

The CI pipeline is defined in `.github/workflows/`:

- **`desktop-build.yml`** — triggered by a `desktop-v*` tag. Builds unsigned installers for all three primary targets. Artefacts are uploaded to the GitHub Actions run.
- **`release.yml`** — signed release builds (stage-010). Uses the `TAURI_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` secrets. Creates a GitHub release with installers attached.

To trigger a CI desktop build, push a tag matching `desktop-v*`:

```sh
git tag desktop-v1.0.0
git push origin desktop-v1.0.0
```

---

## Environment Variables

| Variable | Used by | Required for |
| :--- | :--- | :--- |
| `TAURI_PRIVATE_KEY` | Tauri signer | Signed/release desktop builds |
| `TAURI_KEY_PASSWORD` | Tauri signer | Signed/release desktop builds |
| `PUBLIC_APP_VERSION` | SvelteKit app | Build-time version display (set automatically by `version:sync`) |

No environment variables are required for local development or unsigned desktop builds.

---

## Debugging a Desktop Build

If `pnpm run desktop:build` fails:

1. Check that `pnpm run build` succeeds first (the web bundle must be clean).
2. Verify `pnpm run version:sync` ran — look for consistent version numbers in `package.json` and `src-tauri/tauri.conf.json`.
3. Check that `src-tauri/binaries/` contains the Node.js sidecar binary for your platform.
4. Run `pnpm run check` and `pnpm run lint` to rule out TypeScript or boundary errors.
5. Inspect the Tauri build log for Rust compilation errors — Rust errors will appear below the Vite output.
