# Task 07 — Verify Keyring Integration

**Goal:** Confirm that the packaged desktop app stores the
OpenRouter API key in the OS keyring (Keychain / Credential
Manager / libsecret) and **not** in a plaintext `credentials.json`.
This is the central trust promise of plan-017.

## Why You Need This

Plan-017 stage-008 phase-005 wired `@napi-rs/keyring` behind the
`NOVELLUM_DESKTOP=1` runtime flag (set by the sidecar in
`src-tauri/src/sidecar.rs`). Unit tests cover the wrapper logic
with an injected fake. None of them prove the bridge to the actual
OS Keychain works in a packaged build.

If this is broken, users' API keys will silently fall back to
plaintext on disk — which is exactly the failure mode the desktop
build exists to prevent.

## Steps

1. **Confirm Task 06's smoke-test app is installed.** You'll use it.

2. **Wipe any existing credentials.**

   - macOS: open Keychain Access → search "Novellum" → delete any
     entries.
   - Windows: `cmdkey /list:Novellum*` then
     `cmdkey /delete:Novellum:openrouter` (and any others).
   - Linux: `secret-tool clear service Novellum`.

   Also delete any `credentials.json` at the app-data path:

   ```bash
   # macOS
   rm "$HOME/Library/Application Support/Novellum/credentials.json"
   ```

3. **Launch the packaged app.** Open Settings → AI / OpenRouter.
   Paste a fake API key like `sk-or-test-keyring-validation-001`.
   Click Save.

   First save on macOS: a Keychain prompt may ask you to allow
   "Novellum.app" to write. Click Always Allow.

4. **Verify in the OS keyring.**

   - **macOS:**

     ```bash
     security find-generic-password -s Novellum -a openrouter -w
     ```

     The Keychain entry stores `JSON.stringify(SecureStoreRecord)`,
     not the raw key, so the output is a JSON blob:

     ```json
     {"encryptedKey":"sk-or-test-keyring-validation-001","savedAt":"<ISO>","lastVerifiedAt":null}
     ```

     The `encryptedKey` field name is forward-compat — today the
     value is the plaintext key. Extract it with:

     ```bash
     security find-generic-password -s Novellum -a openrouter -w \
       | jq -r .encryptedKey
     ```

     (or `python3 -c "import sys,json;print(json.loads(sys.stdin.read())['encryptedKey'])"`).

   - **Windows (PowerShell):**

     ```powershell
     cmdkey /list:Novellum*
     ```

     Should list a `LegacyGeneric:target=Novellum/openrouter` entry.
     The actual secret is shown via Credential Manager UI:
     Control Panel → User Accounts → Credential Manager → Windows
     Credentials → expand the Novellum entry. The stored value is
     the same `SecureStoreRecord` JSON blob shown above.

   - **Linux:**

     ```bash
     secret-tool lookup service Novellum account openrouter
     ```

     Returns the `SecureStoreRecord` JSON blob; pipe through
     `jq -r .encryptedKey` to extract the key itself.

5. **Verify NO `credentials.json` appears.**

   ```bash
   ls "$HOME/Library/Application Support/Novellum/"
   ```

   Should NOT contain `credentials.json`. If it does, the runtime
   is incorrectly routing through the filesystem store — file a
   bug with `select-secure-store.ts` as the suspect.

6. **Round-trip the key.**
   - Quit the app fully (`killall Novellum`).
   - Relaunch. Open Settings.
   - Confirm the OpenRouter section shows "API key configured"
     (or whatever your settings UI displays). Do NOT show the raw
     key — that would be a leak.

7. **Delete via the UI.** Click the "Remove API key" button.
   Confirm:

   ```bash
   security find-generic-password -s Novellum -a openrouter
   # → "The specified item could not be found in the keychain."
   ```

8. **(Optional) Test fallback.** On a desktop install, manually
   unset `NOVELLUM_DESKTOP` to force the filesystem path. This is
   tricky because the env var is set by the sidecar code; the
   easiest test is in dev mode where you can override:

   ```bash
   NOVELLUM_DESKTOP=  pnpm dev
   # Save a key via Settings.
   # Confirm credentials.json appears in app-data (dev mode uses .data/ at repo root).
   ```

## Done When

The OS keyring contains the key, no `credentials.json` exists in
the packaged app's data directory, and round-trip works across
relaunches.

## Common Failures

- **"Could not load @napi-rs/keyring native binding"**: the keyring
  package's prebuilt binary for the current platform isn't bundled.
  Check `node_modules/@napi-rs/keyring/keyring.darwin-arm64.node`
  exists; if not, `pnpm install --force`. Also confirm
  `vite.config.ts` doesn't externalize it incorrectly.
- **macOS prompts repeatedly** for "Novellum wants to access
  Keychain": the binary is unsigned. Signing (Task 09) gives the
  app a stable identity that Keychain remembers. Until then, click
  Always Allow on each prompt and it'll persist for that
  unsigned-build identity.
- **Windows shows the entry under `LegacyGeneric:target=Novellum/openrouter`
  but reading via Powershell fails**: cmdkey only shows targets, not
  secrets. Use Credential Manager UI or PowerShell's
  `[Windows.Security.Credentials.PasswordVault]` to read.
