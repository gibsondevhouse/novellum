# Task 10 — Configure CI + Tag the First Release

**Goal:** Add the signing secrets to GitHub, then push the first
`desktop-v*` git tag to trigger the cross-platform build workflow
end-to-end. Download the resulting installers from the Actions
run.

## Why You Need This

`.github/workflows/desktop-build.yml` (created in stage-008
phase-004) builds macOS and Windows artifacts on every
`desktop-v*` tag push. Without secrets configured, the workflow
runs but skips the sign step. With secrets, it produces signed,
distributable installers. This task closes the loop.

## Prerequisites

- Tasks 04–08 done locally — you've validated a working
  packaged build by hand.
- Task 09 done — you have all eight secret values staged in your
  password manager.

The build workflow at
[`.github/workflows/desktop-build.yml`](../../../.github/workflows/desktop-build.yml)
already runs `pnpm run fetch:node` per matrix target before
`tauri build`, so CI artifacts will include the bundled Node
sidecar without further changes.

## Steps

1. **Add GitHub Secrets.**

   Visit `https://github.com/<org>/novellum/settings/secrets/actions`.
   Click "New repository secret" for each:

   - `APPLE_CERTIFICATE` — the base64 of your `developer-id.p12`.
   - `APPLE_CERTIFICATE_PASSWORD` — the password you used during
     `.p12` export.
   - `APPLE_SIGNING_IDENTITY` —
     e.g. `Developer ID Application: Gibson Dev House (ABCD123EFG)`.
   - `APPLE_ID` — your Apple ID email.
   - `APPLE_PASSWORD` — the app-specific password from
     Task 09 step 5.
   - `APPLE_TEAM_ID` — e.g. `ABCD123EFG`.
   - `WINDOWS_CERTIFICATE` — base64 of the `.pfx`.
   - `WINDOWS_CERTIFICATE_PASSWORD` — the .pfx export password.

   Verify each is saved (GitHub will mask them in subsequent
   views).

2. **Sanity-check the workflow runs without secrets first.**

   Go to Actions → Desktop Build → "Run workflow" → Run.

   The unsigned build should succeed on both runners. Download
   the artifacts to confirm. (If signing is wired but secrets
   aren't yet set, the sign step will fail; for stage-008 the
   workflow only builds, not signs — signing comes in plan-018
   stage-010.)

3. **Update the version if needed.**

   ```bash
   # If plan demands bumping past 0.0.1:
   pnpm version 0.1.0 --no-git-tag-version
   pnpm run version:sync     # mirrors to tauri.conf.json + Cargo.toml
   git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
   git commit -m "chore: bump to 0.1.0"
   ```

4. **Tag and push.**

   ```bash
   git tag desktop-v0.0.1
   git push origin desktop-v0.0.1
   ```

   The `desktop-v*` prefix is what `desktop-build.yml`'s
   `on.push.tags` clause matches. Pushing the tag triggers a
   matrix build on `macos-14` (arm64) and `windows-latest`.

5. **Watch the Actions run.**

   Visit `https://github.com/<org>/novellum/actions`. Click the
   triggered run. Expected duration: ~15–25 minutes for a cold
   matrix (Cargo cache misses). Subsequent runs: ~8 minutes.

   If the run fails, scroll to the failed step. Common failures:
   - "version mismatch between Cargo.toml and tauri.conf.json" →
     `predesktop:build` didn't run. Check the workflow's
     `pnpm desktop:build` invocation order.
   - "openssl ssl3_check_cert_and_algorithm" on the Linux build →
     not applicable yet, this matrix only does macOS + Windows.
   - "no space left on device" on the macOS runner → the build
     dir grew too large; add `actions/cleanup` step.

6. **Download artifacts.**

   At the bottom of the run page, an "Artifacts" section lists
   the produced files:
   - `macos-installer` — contains the .dmg.
   - `windows-installer` — contains the .msi.

   Download both. Move to a clean test machine (or VM) and run
   them.

7. **Smoke-test the CI artifacts.**

   Repeat Task 06 (the smoke-test loop) using these CI-built
   installers instead of your local build. Confirm parity:
   the CI build behaves identically to your local build.

8. **Tag the release in GitHub Releases.**

   Visit `https://github.com/<org>/novellum/releases/new`. Choose
   the `desktop-v0.0.1` tag. Title: "V1 Trust Foundation
   pre-alpha". Body: link to the plan-017 closeout.

   Mark as **pre-release** until signing (plan-018 stage-010) is
   in place.

## Done When

- Eight secrets exist in repo settings.
- A `desktop-v*` tag triggers a green Actions run.
- Both .dmg and .msi artifacts are downloadable from the run.
- The CI artifacts pass Task 06's smoke-test on a clean machine.
- A pre-release exists in GitHub Releases.

## Common Failures

- **Workflow not triggered by tag**: confirm the tag name matches
  the `on.push.tags` glob exactly. `v0.0.1` won't trigger;
  `desktop-v0.0.1` will. Verify with `git push --tags --dry-run`.
- **"Resource not accessible by integration"** on Actions: the
  workflow's `permissions:` block may be missing `contents: read`
  or `actions: write`. Open
  `.github/workflows/desktop-build.yml` and add as needed.
- **"unable to access certificate" on macOS runner**: the
  base64 secret has stray newlines. Re-encode without line
  wrapping: `base64 -i developer-id.p12 -o cert.b64` then
  paste the contents of `cert.b64` (single line) into the secret.
