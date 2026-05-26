# Task 01 — Verify Toolchain

**Goal:** Confirm every prerequisite is installed at a working
version on your workstation. Once you can run all the verification
commands without error, every other task in this guide is unblocked.

## Why You Need This

Tauri builds are a layered toolchain (Rust → Tauri CLI → Node →
pnpm → SvelteKit). When something fails, the error usually surfaces
deep in one of the inner layers. Verifying the stack ahead of time
turns "weird build error mid-task" into "I missed a step".

## Required Versions

- **Node 22.x** — `node --version`
- **pnpm 9.x** — `pnpm --version`
- **Rust 1.77.2+** — `cargo --version` and `rustc --version`
- **Tauri CLI 2.10.x** — `pnpm tauri --version`
- **Xcode Command Line Tools** (macOS only) — `xcode-select -p`

Windows requires Visual Studio Build Tools 2022 with the "Desktop
development with C++" workload. Linux requires `webkit2gtk-4.1`,
`libssl-dev`, `build-essential`.

## Steps

1. **Check Node + pnpm.**

   ```bash
   node --version
   pnpm --version
   ```

   If Node is missing, install via [nvm](https://github.com/nvm-sh/nvm):

   ```bash
   nvm install 22
   nvm use 22
   corepack enable
   ```

2. **Check Rust toolchain.**

   ```bash
   cargo --version
   rustc --version
   ```

   If missing, install via [rustup](https://rustup.rs/):

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   ```

3. **Check platform build prerequisites.**

   - **macOS:** `xcode-select --install` if not already installed.
   - **Windows:** install Visual Studio Build Tools 2022 with the
     "Desktop development with C++" workload.
   - **Linux (Ubuntu):**

     ```bash
     sudo apt update
     sudo apt install -y libwebkit2gtk-4.1-dev build-essential \
       curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev \
       librsvg2-dev
     ```

4. **Install repo dependencies.**

   ```bash
   pnpm install
   ```

5. **Verify Tauri CLI is reachable.**

   ```bash
   pnpm tauri --version
   ```

   Expected: `tauri-cli 2.10.x`.

6. **Verify the Rust crate compiles.**

   ```bash
   cd src-tauri && cargo check && cd ..
   ```

   Expected: `Finished dev profile [...]`.

7. **Verify SvelteKit + tests still pass.**

   ```bash
   pnpm run check && pnpm run lint && pnpm run test
   ```

   Expected: `Tests  598 passed (598)` (or higher).

## Done When

All seven steps complete with no errors. Move to
[Task 02 — First Dev Run](../task-02-first-dev-run/task.md).
