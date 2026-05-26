# Task 09 — Education

## What "signing" actually does

A code signature is a cryptographic stamp on the binary that
proves:

1. **Identity.** "This binary was produced by an entity Apple /
   Microsoft validated as Gibson Dev House."
2. **Integrity.** "Nothing has modified this binary since it was
   signed." If anyone tampers with the .app or .exe, the
   signature breaks and the OS refuses to launch it.

Both OSes ship a public-key trust root containing the CA hierarchy
(Apple's Worldwide Developer Relations CA on macOS; the
Microsoft Trusted Root cert store on Windows). Your cert chains up
to that root, so the OS can verify your signature without phoning
home.

## Notarisation vs signing (Apple)

Signing alone is no longer enough on macOS. Since 10.15 Catalina,
Gatekeeper additionally requires **notarisation**:

1. You sign the .app locally with your Developer ID cert.
2. You upload the signed .app to Apple's notary service.
3. Apple's automated scanner checks for malware, runs lightweight
   static analysis, and (within minutes-to-hours) returns either
   APPROVED or REJECTED.
4. If approved, you "staple" the notarisation ticket to the .app
   so future launches don't need an internet connection.

Notarisation requires you to enable the **hardened runtime** when
signing (`--options runtime`). The hardened runtime restricts
certain dynamic-library loading and JIT — Tauri apps work fine
under it, but you may need to declare entitlements for things like
keyring access.

This is wired in plan-018 stage-010.

## Why Windows OV needs a "reputation period"

Microsoft SmartScreen uses a heuristic: an unknown publisher's
binary is treated as suspicious until it has been downloaded and
launched by ~thousands of users without being reported as
malicious. EV certs come with **immediate reputation** because the
EV validation process is rigorous enough that Microsoft trusts the
publisher up-front. OV certs start at zero reputation and grow it
over the first ~30 days of distribution.

Practical impact: with an OV cert, your first beta testers will
still see SmartScreen warnings for the first month or so. After
that, fresh installs will be silent.

## Why we don't use a self-signed cert

You CAN sign with a self-generated cert, and the cryptographic
math is identical. But neither macOS Gatekeeper nor Windows
SmartScreen trusts arbitrary roots — they only trust certs chained
to Apple's WWDR CA or Microsoft's Trusted Root program. So a
self-signed binary is, from the OS's perspective, no different
from an unsigned one. The user still sees the malware warnings.

The CA fee buys you membership in the OS-trusted PKI hierarchy.
There is no shortcut.

## What gets signed inside the .app

`codesign` recurses through the bundle. For Tauri apps:

- The main `Novellum` binary (Rust).
- The `node-aarch64-apple-darwin` sidecar binary.
- Any `.dylib` files in `Contents/Frameworks/` (currently none).

If ANY signed component fails verification, the whole app fails
to launch. This is why bundling unsigned Node binaries is a
problem — you have to sign the bundled Node yourself with your
Developer ID. The plan-018 stage-010 sign step handles this via:

```bash
codesign --force --options runtime --sign "$APPLE_SIGNING_IDENTITY" \
  "Novellum.app/Contents/MacOS/node-aarch64-apple-darwin"
codesign --force --options runtime --sign "$APPLE_SIGNING_IDENTITY" \
  "Novellum.app"  # final outer signature
```

Order matters: sign inner binaries first, then the outer bundle.

## Cost summary

- Apple Developer Program: $99/yr.
- Windows OV cert: $200–400/yr.
- Total: ~$300–500/yr for a one-product publisher.

These are operating costs, not capex. Bake them into the project
budget.
