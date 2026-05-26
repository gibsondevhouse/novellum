# Task 10 — Education

## Why a separate `desktop-v*` tag prefix

Plan-013 onward uses normal semver tags (`v0.0.1`) for web /
SvelteKit deploys. If desktop tags shared that prefix, every
web release would also trigger a 25-minute desktop matrix build
(and consume macOS runner minutes — those are 10× the cost of
Linux runners).

By splitting prefixes:

- `v0.0.1` → web deploy only.
- `desktop-v0.0.1` → desktop matrix only.

The two release cadences can diverge (e.g. you ship 12 web
releases for every desktop release) without paying for builds you
don't need.

## What `actions/cache` is doing for you

The workflow caches `~/.cargo` and `src-tauri/target/`. Cargo's
build artifacts are large (~3 GB) but stable across builds — only
files you touched recompile. Without the cache, every CI run
takes ~25 minutes; with it, ~8 minutes after the first warm run.

Cache key strategy:

```yaml
key: ${{ runner.os }}-cargo-${{ hashFiles('src-tauri/Cargo.lock') }}
restore-keys: ${{ runner.os }}-cargo-
```

The exact key matches when `Cargo.lock` is unchanged (full hit).
The `restore-keys` prefix gives a partial hit on lockfile changes
— Cargo only rebuilds the dependencies that actually differ.

## Why matrix builds need their own runners

You can't build a macOS .dmg on a Linux runner because
`tauri-bundler` shells out to macOS-only tools (`hdiutil`,
`SetFile`, `pkgbuild`). Same for Windows .msi (needs WiX, which
runs on Linux but produces inferior output compared to a real
Windows runner).

GitHub provides:

- `macos-14` — arm64 M1 runner, free for public repos.
- `windows-latest` — Windows Server 2022 with Visual Studio
  Build Tools.
- `ubuntu-latest` — for Linux AppImage / .deb (not in stage-008's
  scope).

For private repos, runner minutes are billed at:

- Linux: 1× rate (~$0.008/min).
- Windows: 2× rate.
- macOS: 10× rate.

A full desktop build matrix run costs roughly $0.50 on a private
repo. Bake this into the budget if you migrate to private.

## Why pre-release until signing is wired

GitHub Releases has a `prerelease: true` flag. When set:

- The release doesn't appear in the "Releases" tab as the
  "latest".
- Auto-update channels treat it as opt-in.
- It signals to anyone who finds the URL: "this is a beta, expect
  rough edges".

Use this until plan-018 stage-010 lands the sign+notarise step.
Once signing is in, the next release can be a non-prerelease and
the workflow can produce installers users will trust.

## What the auto-updater story looks like later

`src/lib/desktop/updater.ts` currently returns
`{ kind: 'unsupported' }`. The plan-018 roadmap calls for
implementing `tauri-plugin-updater` driven by GitHub Releases
metadata:

1. App polls
   `https://api.github.com/repos/<org>/novellum/releases/latest`.
2. If a newer `desktop-v*` tag exists, the updater downloads its
   .dmg/.msi.
3. Tauri's update plugin verifies the signature against your
   public key (separate from code-signing — uses
   `tauri-plugin-updater`'s own ed25519 keys) and applies.

Implementing this requires generating an updater keypair via
`tauri signer generate` and storing the private key as
`TAURI_PRIVATE_KEY` GitHub Secret. Out of scope for V1; tracked in
plan-018.
