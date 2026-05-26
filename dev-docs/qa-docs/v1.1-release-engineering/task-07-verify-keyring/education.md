# Task 07 — Education

## What `@napi-rs/keyring` actually does

`@napi-rs/keyring` is a native N-API addon that maps a uniform
JavaScript API onto each OS's credential storage:

- **macOS:** Security framework's Keychain Services
  (`SecItemAdd`, `SecItemCopyMatching`, `SecItemDelete`).
- **Windows:** Credential Manager
  (`CredWriteW`, `CredReadW`, `CredDeleteW`).
- **Linux:** libsecret over D-Bus (gnome-keyring or KWallet).

When the JS code calls
`new Entry('Novellum', 'openrouter').setPassword(value)`, the
addon delegates to the platform's secure store. The OS encrypts
at rest (Keychain uses AES-256 with a key derived from the user's
login password; Credential Manager uses DPAPI tied to the user
profile).

## Why the "no credentials.json" check matters

Look at `src/lib/server/credentials/select-secure-store.ts`. The
function reads `NOVELLUM_DESKTOP` from `process.env`. If it's `1`,
return the keyring store; otherwise return the filesystem store.

The sidecar sets this env var when spawning the Node child (see
`src-tauri/src/sidecar.rs::spawn`). So in a packaged build, every
write goes to the keyring.

If you DO see a `credentials.json` in the packaged app's data
folder, the env var is not propagating. Likely causes:

1. `tauri-plugin-shell` strips the env (it has env-allowlist
   capabilities; check `src-tauri/capabilities/default.json`).
2. The sidecar respawned without the env (e.g. crash recovery).
3. A test or dev artifact got copied into the packaged bundle.

## Why we don't bundle a single "encrypted JSON file" instead

It's tempting to skip the OS keyring and just AES-encrypt
`credentials.json`. The problem: where do you store the encryption
key?

- In the binary → anyone with the .app can extract it.
- In a separate file → same problem, just with extra steps.
- Derived from user login password → you've reinvented the OS
  keyring, badly.

The OS keyring solves this once for the whole platform. Re-using
it is cheaper and more secure than rolling your own.

## What `security find-generic-password` is doing

The `security` CLI is macOS's interface to Keychain Services. The
flags:

- `-s Novellum` → match service name "Novellum".
- `-a openrouter` → match account "openrouter".
- `-w` → print the password (this triggers a Keychain access
  prompt the first time, unless you clicked "Always Allow" earlier).

Without `-w`, you get metadata only (creation date, last-modified,
which app accessed it last). Useful for confirming the entry exists
without printing the secret.

## The runtime selector chokepoint

All credential reads/writes go through one function:
`createSecureStore` in `src/lib/server/credentials/select-secure-store.ts`.
This is deliberate. Every API surface that touches credentials
calls this one factory. If you find code that bypasses it
(directly imports `createKeyringSecureStore` or
`createFilesystemSecureStore`), that's a code-review fail —
flag it.
