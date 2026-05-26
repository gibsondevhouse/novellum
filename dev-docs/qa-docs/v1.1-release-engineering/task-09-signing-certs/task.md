# Task 09 — Acquire Signing Certificates

**Goal:** Procure the Apple Developer Program membership and a
Windows code-signing certificate so that future packaged builds
can be signed and notarised. **Procurement takes 1–4 weeks; start
this in parallel with technical work.**

## Why You Need This

Unsigned builds work for you and CI but fail in the user's hands:

- **macOS:** Gatekeeper shows "Novellum cannot be opened because
  Apple cannot check it for malicious software". Most users will
  not right-click → Open. They'll uninstall.
- **Windows:** SmartScreen shows "Windows protected your PC.
  Microsoft Defender SmartScreen prevented an unrecognised app
  from starting." Most users will click "Don't Run". They'll
  uninstall.

Signing is the line between "developer demo" and "shippable
product".

The full signing-posture context lives at
`dev-docs/plans/plan-017-v1-trust-foundation/stage-008-desktop-packaging/evidence/signing-posture.md`.
This task is about the procurement steps; the wiring lives in
plan-018 stage-010.

## Apple Developer Program

1. **Confirm legal entity.** Decide whether to enroll as Gibson
   Dev House (organisation) or as an individual. Org enrollment
   requires a D-U-N-S number (free, takes ~5 days to obtain from
   `developer.apple.com/enroll/duns-lookup`). Individual is
   instant but the certs are tied to your personal name in the
   Gatekeeper signature.

2. **Enroll.** Visit `https://developer.apple.com/programs/enroll/`,
   sign in with the Apple ID you want associated with releases.
   Pay $99 USD. Membership renews annually.

3. **Generate a "Developer ID Application" certificate.** This is
   the cert type for distributing OUTSIDE the App Store (via your
   own website / .dmg downloads).

   Steps:
   - In Keychain Access: Certificate Assistant → Request a
     Certificate from a Certificate Authority. Save the CSR file.
   - In Apple Developer portal: Certificates, IDs & Profiles →
     Certificates → "+" → Developer ID Application → upload the
     CSR.
   - Download the resulting `.cer` and double-click to install
     into Keychain.

4. **Export as .p12 for CI.**

   ```bash
   # In Keychain Access, find "Developer ID Application: <Your Name>"
   # Right-click → Export → save as developer-id.p12 with a strong password.

   base64 < developer-id.p12 | pbcopy
   # That's your APPLE_CERTIFICATE secret value.
   ```

5. **Generate an app-specific password for notarisation.**
   Apple's notary service requires a separate "app-specific
   password" (NOT your Apple ID password):
   - Visit `appleid.apple.com` → Sign-In and Security →
     App-Specific Passwords → "+".
   - Label it "Novellum CI Notary".
   - Save the generated `xxxx-xxxx-xxxx-xxxx` value — you can't
     retrieve it again.

6. **Note your Team ID.** Find it at
   `https://developer.apple.com/account/#!/membership/`. Looks
   like `ABCD123EFG`. You'll need it for the
   `--team-id` flag during notarisation.

## Windows Code-Signing

Two flavours; both work, EV is more painless:

- **OV (Organisation Validation)** — ~$200–400/yr from
  DigiCert / Sectigo / SSL.com. Issued in days. Apps still need
  to "build SmartScreen reputation" for ~30 days of installs
  before warnings stop showing.
- **EV (Extended Validation)** — ~$400–700/yr. Requires HSM
  (USB hardware token) or HSM-as-a-service (Azure Key Vault).
  SmartScreen warnings disappear immediately.

For a V1 app with low install volume, **OV is the pragmatic
choice**: cheaper, no HSM hassle, and most users will tolerate the
30-day reputation period.

1. **Choose a CA.** SSL.com, DigiCert, and Sectigo all sell to
   small entities. Comodo (Sectigo) is usually cheapest at the
   OV tier.

2. **Order an OV Code Signing Certificate.** You'll provide:
   - Legal entity name (must match incorporation docs).
   - Business address, phone, etc.
   - Government-issued business registration document.
   - Stripe / bank statement to prove operating status.

3. **Validation phase (1–10 days).** The CA will:
   - Verify your business via D-U-N-S or government records.
   - Phone-verify you using a number from a third-party
     directory (NOT a number you provided).
   - Email-verify the WHOIS contact for your domain.

4. **Issuance.** You receive a download link or .pfx file. If
   they offer "soft cert" for OV (no HSM), download the .pfx
   directly. Save the password.

5. **Convert for CI.**

   ```powershell
   # On Windows
   certutil -encode certificate.pfx certificate.b64
   # Strip the BEGIN/END lines from certificate.b64.
   # That base64 blob is WINDOWS_CERTIFICATE.
   ```

## Done When

- Apple Developer Program shows "Active" membership.
- Developer ID Application certificate downloaded, installed in
  Keychain, exported to `developer-id.p12`.
- Apple app-specific password saved in your password manager.
- Apple Team ID noted.
- Windows OV code-signing cert delivered as `.pfx`.
- All five secrets ready to paste into GitHub Secrets in Task 10:
  - `APPLE_CERTIFICATE` (base64 of .p12)
  - `APPLE_CERTIFICATE_PASSWORD` (.p12 export password)
  - `APPLE_SIGNING_IDENTITY`
    (e.g. `Developer ID Application: Gibson Dev House (ABCD123EFG)`)
  - `APPLE_ID` (your Apple ID email)
  - `APPLE_PASSWORD` (the app-specific password from step 5)
  - `APPLE_TEAM_ID` (e.g. `ABCD123EFG`)
  - `WINDOWS_CERTIFICATE` (base64 of .pfx)
  - `WINDOWS_CERTIFICATE_PASSWORD` (.pfx export password)

## Common Failures

- **Apple D-U-N-S lookup says your business doesn't exist**: D&B
  might not have indexed your incorporation yet. Submit a request
  for a new D-U-N-S; takes ~5 business days.
- **Sectigo phone-verification fails repeatedly**: they pull from
  third-party directories (BBB, ZoomInfo). Get listed on
  ZoomInfo or Google Business first.
- **CA refuses sole proprietorship for OV**: some CAs require an
  LLC / Inc. SSL.com is most lenient with sole proprietors.
