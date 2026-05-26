# Release Runbook

> Last verified: 2026-05-07

Novellum ships as desktop binaries (Tauri) plus a runnable SvelteKit Node app. This runbook covers cutting a release.

## Pre-release gates

Before tagging, all must pass:

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm check:tokens`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm test:visual` (snapshots reviewed if updated)

## Version bump

1. Pick the new version (semver).
2. Update [package.json](../../package.json) `version`.
3. Run `pnpm version:sync` — mirrors into [src-tauri/Cargo.toml](../../src-tauri/Cargo.toml) and [src-tauri/tauri.conf.json](../../src-tauri/tauri.conf.json).
4. Commit: `chore: release vX.Y.Z`.

## Changelog

```bash
pnpm changelog
```

Generates / updates [../../CHANGELOG.md](../../CHANGELOG.md) via [scripts/generate-changelog.mjs](../../scripts/generate-changelog.mjs). Review and edit the output for human readability.

## Build artifacts

```bash
pnpm fetch:node          # ensures the platform Node binary is fresh
pnpm desktop:build       # produces .dmg / .msi / .AppImage in src-tauri/target/release/bundle/
```

For a fast non-release smoke build:

```bash
pnpm desktop:preview     # tauri build --debug
```

## Tag and push

```bash
git tag vX.Y.Z
git push origin master --tags
```

(Confirm with the user before pushing tags.)

## Smoke test the binary

On each target platform, install the binary fresh and verify:

1. App launches; sidecar starts; WebView loads.
2. Create a new project; save; close; reopen — data persists.
3. Configure OpenRouter key; run a Continuity check; observe results.
4. Backup → wipe DB → restore — round-trip succeeds.
5. Settings → Data shows the expected storage location.

## Rollback

If a packaging issue ships:

1. Re-tag the previous good version as the canonical "latest".
2. Open a hotfix plan under `dev-docs/plans/` with a single stage.
3. Cut a patch release once the fix is in.

## Release notes

- Source from `CHANGELOG.md` and the closed plans for the cycle.
- Cross-link the user-facing entries from [../../novellum-docs/user/](../../novellum-docs/user/) where applicable.
- Highlight any migration that runs automatically on first launch.

## Plans relevant to release

- [plan-017-v1-trust-foundation](../plans/plan-017-v1-trust-foundation/plan.md) — desktop packaging stage (complete).
- [plan-018-v1-product-experience](../plans/plan-018-v1-product-experience/plan.md) — CI/release stage and licensing stage (in flight).
