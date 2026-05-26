# Task 07 — Checklist (with how-to)

Verify that the packaged app stores the OpenRouter API key in macOS
**Keychain**, not in a plaintext `credentials.json`.

**Prereq:** Task 06's smoke-test app is installed at
`/Applications/Novellum.app`.

---

### 1. Wipe any existing Novellum keyring entries

**Run:**

```bash
security delete-generic-password -s Novellum -a openrouter 2>/dev/null
echo "wipe done"
```

(If no entry exists yet, the command harmlessly returns "could not
be found". That's fine.)

To double-check via the UI: open **Keychain Access** (Spotlight →
"Keychain Access"), search "Novellum", delete any entries with
right-click → Delete.

- [ ] Keychain wiped of Novellum entries

---

### 2. Wipe any existing plaintext credentials.json

**Run:**

```bash
rm -f "$HOME/Library/Application Support/Novellum/credentials.json"
ls "$HOME/Library/Application Support/Novellum/"
```

**Expect:** the listing should NOT include `credentials.json`.

- [ ] `credentials.json` deleted (or never existed)

---

### 3. Save a test API key via the Settings UI

1. Launch `/Applications/Novellum.app`.
2. Open **Settings** (gear icon, or wherever Settings lives in
   the nav).
3. Find the **AI / OpenRouter** section.
4. Paste this exact test key:

   ```
   sk-or-test-keyring-validation-001
   ```

5. Click **Save**.

On macOS, **Keychain may prompt** "Novellum.app wants to use your
confidential information stored in 'Novellum'". Click **Always
Allow**. (This prompt only appears for unsigned builds; signing
in Task 09 makes it stable.)

- [ ] Test key pasted and saved
- [ ] Keychain prompt accepted (if it appeared)

---

### 4. Confirm the key landed in Keychain

**Run:**

```bash
security find-generic-password -s Novellum -a openrouter -w
```

**Expect:** A JSON blob like

```json
{"encryptedKey":"sk-or-test-keyring-validation-001","savedAt":"<ISO>","lastVerifiedAt":null}
```

The Keychain entry stores `JSON.stringify(SecureStoreRecord)`, not
the raw key. To extract the key itself:

```bash
security find-generic-password -s Novellum -a openrouter -w \
  | jq -r .encryptedKey
```

If `find-generic-password` prints "could not be found": the runtime
is NOT using the keyring. Skip ahead to step 6 to confirm it fell
back to the filesystem (which would be a bug).

- [ ] Keychain returned the test key

---

### 5. Confirm NO `credentials.json` was created

**Run:**

```bash
ls "$HOME/Library/Application Support/Novellum/"
```

**Expect:** `novellum.db` is there. **`credentials.json` is not.**

If `credentials.json` exists, the runtime is incorrectly routing
through the filesystem store. File a bug naming
`select-secure-store.ts` as the suspect.

- [ ] No `credentials.json` exists in the app-data directory

---

### 6. Round-trip across a relaunch

1. Quit the app (`Cmd + Q`).
2. Relaunch from `/Applications/Novellum.app`.
3. Open Settings → AI / OpenRouter section.

**Expect:** the section indicates an API key is configured (label,
checkmark, "Saved" badge — whatever the UI uses). It must **not**
display the raw key value (that would be a leak).

- [ ] Settings shows "API key configured" after relaunch
- [ ] Raw key is NOT shown anywhere on screen

---

### 7. Delete via the UI and confirm the keyring is empty

1. In Settings, click **Remove API key** (or equivalent).
2. Confirm the action if prompted.

**Run:**

```bash
security find-generic-password -s Novellum -a openrouter -w
```

**Expect:** `The specified item could not be found in the keychain.`

- [ ] Keyring entry removed by UI button

---

### 8. No plaintext leakage anywhere

Quick sanity scan:

```bash
log show --predicate 'process == "Novellum"' --info --last 10m \
  | grep -i 'sk-or' || echo "no plaintext key in logs"
grep -rn 'sk-or-test-keyring-validation' \
  "$HOME/Library/Application Support/Novellum/" 2>/dev/null \
  || echo "no plaintext key on disk"
```

**Expect:** Both commands print "no plaintext key ..." messages.

- [ ] No plaintext key in unified logs
- [ ] No plaintext key in app-data files

---

## Done

All boxes green = the keyring promise holds in the packaged build.
Move to [Task 08 — Replace Placeholder Icons](../task-08-brand-icons/task.md).
