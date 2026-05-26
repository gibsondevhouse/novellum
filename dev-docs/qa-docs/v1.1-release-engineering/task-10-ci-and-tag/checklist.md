# Task 10 — Checklist (with how-to)

Push the signing secrets to GitHub, tag the release, and download
the CI-built installers.

**Prereq:** Tasks 04–09 done. You should have all eight secrets
staged in your password manager.

---

## A. Add GitHub Secrets

For each of the eight secrets, do the same procedure:

1. Visit `https://github.com/gibsondevhouse/novellum/settings/secrets/actions`.
2. Click **New repository secret**.
3. Set the **Name** exactly as listed below (case-sensitive).
4. Paste the **Value** from your password manager.
5. Click **Add secret**.

GitHub masks the value after saving. You can update but not view it
again.

- [ ] `APPLE_CERTIFICATE` set (base64 of .p12, single line, no
      wrapping)
- [ ] `APPLE_CERTIFICATE_PASSWORD` set
- [ ] `APPLE_SIGNING_IDENTITY` set (e.g. `Developer ID Application: Your Name (ABCD123EFG)`)
- [ ] `APPLE_ID` set (your Apple ID email)
- [ ] `APPLE_PASSWORD` set (app-specific password)
- [ ] `APPLE_TEAM_ID` set (10-char Team ID)
- [ ] `WINDOWS_CERTIFICATE` set (base64 of .pfx)
- [ ] `WINDOWS_CERTIFICATE_PASSWORD` set

---

## B. Sanity-check the workflow runs without secrets first

1. Visit `https://github.com/gibsondevhouse/novellum/actions/workflows/desktop-build.yml`.
2. Click **Run workflow** → choose `master` → **Run workflow**.

This triggers a manual build on both runners (no signing yet —
signing wiring is plan-018 stage-010). Watch it; both legs should
go green.

- [ ] Manual workflow run triggered
- [ ] macOS leg green
- [ ] Windows leg green
- [ ] Artifacts downloadable from the run page

If a leg fails: open the failed step, scroll to the last 50 lines,
fix, push, retry.

---

## C. Bump the version (optional)

If plan-017's first ship needs a version higher than `0.0.1`:

```bash
pnpm version 0.1.0 --no-git-tag-version
pnpm run version:sync
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: bump to 0.1.0"
git push
```

Otherwise skip this section.

- [ ] Version bumped (if needed) and pushed (or section skipped)

---

## D. Tag and push

The workflow's `on.push.tags` matches `desktop-v*`. Tag exactly
that prefix:

```bash
git tag desktop-v0.0.1   # or desktop-v0.1.0 if you bumped
git push origin desktop-v0.0.1
```

Verify the tag was pushed:

```bash
git ls-remote --tags origin | grep desktop-v
```

**Expect:** the tag is listed.

- [ ] Tag created locally
- [ ] Tag pushed to origin
- [ ] Tag visible on remote

---

## E. Watch the Actions run

1. Visit `https://github.com/gibsondevhouse/novellum/actions`.
2. Click the most recent run (triggered by your tag push).

**Expect duration:** 15–25 minutes cold matrix, ~8 minutes warm.

Common failures and fixes:

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `version mismatch between Cargo.toml and tauri.conf.json` | `predesktop:build` skipped | Confirm workflow runs `pnpm desktop:build`, not `tauri build` directly |
| `no space left on device` (macOS) | runner disk full | Add `actions/cleanup` step before build |
| `unable to access certificate` (macOS) | base64 secret has stray newlines | Re-encode without wrapping: `base64 -i developer-id.p12 -o cert.b64`, paste single line |
| Run not triggered by your tag | tag doesn't match `desktop-v*` glob | Verify tag name; `git push origin desktop-v0.0.1` exactly |

- [ ] Both matrix legs went green

---

## F. Download artifacts

Scroll to the bottom of the green run page. Under **Artifacts**:

- `novellum-aarch64-apple-darwin` — contains the `.dmg`.
- `novellum-x86_64-pc-windows-msvc` — contains the `.msi`.

Click each to download a zip. Extract.

- [ ] `.dmg` downloaded
- [ ] `.msi` downloaded

---

## G. Smoke-test the CI artifacts

For each artifact, repeat **Task 06** (the smoke-test loop) on a
clean machine:

- macOS: install the `.dmg` to a fresh user account or VM.
- Windows: install the `.msi` to a fresh VM (use a free copy of
  Windows Sandbox if you're on Win11 Pro).

The CI build must behave identically to your local build.

- [ ] CI .dmg passes Task 06 on a clean macOS machine
- [ ] CI .msi passes Task 06 on a clean Windows machine

---

## H. Create a GitHub Release

1. Visit `https://github.com/gibsondevhouse/novellum/releases/new`.
2. Click **Choose a tag** → pick `desktop-v0.0.1`.
3. **Title:** `V1 Trust Foundation pre-alpha`.
4. **Body:** link to the plan-017 closeout doc, e.g.
   `dev-docs/plans/plan-017-v1-trust-foundation/MASTER-PLAN.md`.
5. Tick **Set as a pre-release** (until plan-018 stage-010 wires
   real signing).
6. Optionally upload the `.dmg` and `.msi` from step F as release
   assets so people don't need to dig into Actions.
7. Click **Publish release**.

- [ ] Release published as **pre-release**
- [ ] Linked from the plan-017 closeout doc

---

## Done

All boxes green = the desktop pipeline is closed. The repo can
produce a tagged, downloadable installer set on demand. Future
work (proper signing/notarisation/auto-update) is plan-018
stage-010.
