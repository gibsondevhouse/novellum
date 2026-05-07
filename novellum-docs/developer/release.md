# Release

> Last verified: 2026-05-07

Quick reference. Full procedure: [../../dev-docs/05-workflow/release.md](../../dev-docs/05-workflow/release.md).

## Pre-release gates

All must pass:

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm check:tokens
pnpm test
pnpm test:e2e
pnpm test:visual
```

## Bump version

1. Update `version` in [../../package.json](../../package.json).
2. `pnpm version:sync` — mirrors into Tauri config + Cargo.
3. Commit `chore: release vX.Y.Z`.

## Generate changelog

```bash
pnpm changelog
```

Review and edit [../../CHANGELOG.md](../../CHANGELOG.md) for human readability.

## Build artifacts

```bash
pnpm fetch:node
pnpm desktop:build
```

Outputs `.dmg` / `.msi` / `.AppImage` under `src-tauri/target/release/bundle/`.

## Tag and push

```bash
git tag vX.Y.Z
git push origin master --tags
```

(Confirm with maintainers before pushing tags.)

## Smoke test

On each platform, install the artifact and verify:

1. App launches; sidecar starts; WebView loads.
2. Create a project; save; reopen — data persists.
3. Configure key; run a Continuity check; observe results.
4. Backup → wipe DB → restore — round-trip succeeds.

## Rollback

If a release misbehaves:

1. Re-tag the previous good version.
2. Open a hotfix plan under `dev-docs/plans/` with a single stage.
3. Cut a patch release once the fix is in.
