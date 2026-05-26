# Task 09 — Checklist (with how-to)

Procurement task. Total wall-clock time: 1–4 weeks. Most of the
time is waiting on Apple / your CA, not active work.

**Start this BEFORE Task 04.** It runs in parallel with everything
else and has the longest lead time.

---

## A. Apple Developer Program

### A1. Decide org vs individual

- **Organisation** (e.g. "Gibson Dev House"): certs say your
  company name. Requires D-U-N-S number.
- **Individual**: certs say your personal name. Instant enrolment.

For Novellum's V1 ship, **individual is faster**. Org is only
worth the D-U-N-S delay if you have multiple developers or want
the company branding on Gatekeeper signatures.

- [ ] Decision recorded: __________

---

### A2. (If org) Get a D-U-N-S number

**Run:**

Visit `https://developer.apple.com/enroll/duns-lookup/`.

Search for your company. If found, copy the number. If not,
submit a request for a new one (free, takes ~5 business days).

- [ ] D-U-N-S number obtained: __________ (skip if individual)

---

### A3. Enrol in the Apple Developer Program

1. Visit `https://developer.apple.com/programs/enroll/`.
2. Sign in with the Apple ID you want to associate with releases.
   **Use a permanent email**, not a personal one you might lose.
3. Pay $99 USD. Annual renewal.
4. Wait for the "Welcome to the Apple Developer Program" email
   (usually < 24 h, occasionally up to 2 days).

- [ ] Enrolment shows **Active** at
      `https://developer.apple.com/account/`

---

### A4. Generate a Certificate Signing Request (CSR)

1. Open **Keychain Access** (Spotlight → Keychain Access).
2. Menu: **Keychain Access → Certificate Assistant → Request a
   Certificate from a Certificate Authority...**
3. Fill in:
   - User Email Address: your Apple ID email.
   - Common Name: your name (or company name if org).
   - CA Email Address: leave blank.
   - Choose **Saved to disk**.
4. Click **Continue**, save as `CertificateSigningRequest.certSigningRequest`.

- [ ] CSR file saved to disk

---

### A5. Generate a Developer ID Application certificate

1. Visit `https://developer.apple.com/account/resources/certificates/list`.
2. Click **+** to add a new certificate.
3. Choose **Developer ID Application** (NOT "Developer ID Installer"
   and NOT "Apple Distribution"). This is the cert for shipping
   outside the App Store.
4. Click **Continue**.
5. Upload the CSR from step A4. Click **Continue**.
6. Click **Download**. You get `developerID_application.cer`.
7. **Double-click the .cer file** to install it into Keychain.

- [ ] Cert installed in local Keychain (visible in Keychain Access
      under "My Certificates", named `Developer ID Application: ...`)

---

### A6. Export the certificate as .p12

1. In **Keychain Access**, navigate to **My Certificates**.
2. Find your `Developer ID Application: ...` entry. Expand the
   triangle to confirm it has a private key inside.
3. Right-click the certificate → **Export "Developer ID Application: ..."**.
4. Save as `developer-id.p12`.
5. Set a **strong export password** (write it in your password
   manager — you'll need it for CI).

**Verify:**

```bash
file developer-id.p12
```

**Expect:** `data` (P12 is a binary format).

- [ ] `developer-id.p12` exported with a strong password
- [ ] Export password saved to password manager

---

### A7. Base64-encode the .p12 for GitHub Secrets

**Run:**

```bash
base64 -i developer-id.p12 -o developer-id.p12.b64
wc -l developer-id.p12.b64   # should be 1 line, no newlines
pbcopy < developer-id.p12.b64
```

The contents are now on your clipboard. Paste them straight into
your password manager under a note labelled `APPLE_CERTIFICATE`.

- [ ] Base64 of .p12 saved in password manager as
      `APPLE_CERTIFICATE`

---

### A8. Generate an app-specific password (for notarisation)

1. Visit `https://appleid.apple.com/`.
2. Sign in.
3. Go to **Sign-In and Security → App-Specific Passwords**.
4. Click **+** to generate a new one.
5. Label it `Novellum CI Notary`.
6. Copy the generated `xxxx-xxxx-xxxx-xxxx` immediately —
   **you cannot view it again**.
7. Save in your password manager as `APPLE_PASSWORD`.

- [ ] App-specific password generated and saved

---

### A9. Note your Apple Team ID

**Run:**

Visit `https://developer.apple.com/account/#!/membership/`.

The **Team ID** is a 10-character string like `ABCD123EFG`.

Save it in your password manager as `APPLE_TEAM_ID`.

- [ ] Team ID recorded: __________

---

### A10. Note the full signing identity string

**Run:**

```bash
security find-identity -v -p codesigning
```

**Expect:** A line like:

```
1) ABC123... "Developer ID Application: Your Name (ABCD123EFG)"
```

Copy the part inside the quotes. That's your `APPLE_SIGNING_IDENTITY`.

- [ ] `APPLE_SIGNING_IDENTITY` recorded:
      `Developer ID Application: __________ (__________)`

---

## B. Windows Code-Signing

### B1. Choose OV vs EV

- **OV (Organisation Validation)**: $200–400/yr. SmartScreen
  warnings persist for ~30 days then disappear as reputation
  builds.
- **EV (Extended Validation)**: $400–700/yr + HSM hardware.
  Warnings vanish immediately.

**For V1 with low install volume, OV is the right call.**

- [ ] Choice recorded: __________

---

### B2. Choose a CA

Recommended:
- **SSL.com** — most lenient with sole proprietors.
- **Sectigo (Comodo)** — usually cheapest at OV tier.
- **DigiCert** — premium pricing, best support.

- [ ] CA chosen: __________

---

### B3. Place the order

Visit your chosen CA's site. Order **OV Code Signing**
(NOT SSL/TLS, NOT EV unless you specifically chose it).

You'll provide:
- Legal entity name (must match incorporation docs exactly)
- Business address, phone
- Government business registration document
- Bank or Stripe statement to prove operating status

- [ ] Order placed
- [ ] Order number / reference recorded: __________

---

### B4. Complete validation

The CA will:

1. **D-U-N-S or government registry check** (1–3 days).
2. **Phone verification** — they call a number from a third-party
   directory (NOT a number you provided). If your business isn't
   listed publicly, list it on Google Business / ZoomInfo first.
3. **Email verification** of the WHOIS contact for your domain.

- [ ] Business validation passed
- [ ] Phone verification call completed
- [ ] Email verification completed

---

### B5. Receive the .pfx

Once validation passes, the CA delivers either:
- A download link that produces `certificate.pfx`, or
- A "soft cert" delivery email with the .pfx attached.

If they offer "soft cert" for OV (no HSM required), take it.

**Save the export password the CA provides.** Store both the .pfx
and the password in your password manager.

- [ ] `.pfx` file received and stored securely
- [ ] `.pfx` export password saved as
      `WINDOWS_CERTIFICATE_PASSWORD` in password manager

---

### B6. Base64-encode the .pfx

You can do this on macOS — base64 is platform-agnostic:

```bash
base64 -i certificate.pfx -o certificate.pfx.b64
pbcopy < certificate.pfx.b64
```

Save the clipboard contents in your password manager as
`WINDOWS_CERTIFICATE`.

- [ ] Base64 of .pfx saved as `WINDOWS_CERTIFICATE`

---

## C. Final secret roster

Confirm all eight values are staged in your password manager,
ready for Task 10:

- [ ] `APPLE_CERTIFICATE` (base64 of .p12)
- [ ] `APPLE_CERTIFICATE_PASSWORD` (.p12 export password)
- [ ] `APPLE_SIGNING_IDENTITY` (e.g. `Developer ID Application: Your Name (ABCD123EFG)`)
- [ ] `APPLE_ID` (your Apple ID email)
- [ ] `APPLE_PASSWORD` (app-specific password from A8)
- [ ] `APPLE_TEAM_ID` (10-char Team ID from A9)
- [ ] `WINDOWS_CERTIFICATE` (base64 of .pfx)
- [ ] `WINDOWS_CERTIFICATE_PASSWORD` (.pfx export password)

---

## Done

All boxes green = you're ready for Task 10. Move to
[Task 10 — Configure CI + Tag First Release](../task-10-ci-and-tag/task.md).
