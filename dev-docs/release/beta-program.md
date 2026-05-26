# Novellum V1 Beta Program

## Overview

The Novellum V1 beta is a closed program for fiction writers who want early access in exchange for structured feedback. Beta builds are full-featured; limitations are listed below.

## How to Join

1. Request access via GitHub Issues (label: `beta-request`) or the designated feedback channel.
2. Accepted testers receive a direct download link for the beta installer.
3. Testers agree to the EULA and acknowledge the Beta Tester Addendum.

## Beta Test Flow

Every tester should complete the following in order:

1. **Install** — download and install the macOS `.dmg` or Windows `.msi` build.
2. **Onboarding** — complete the onboarding flow; report any confusing steps.
3. **Write** — create a project, add at least one chapter and three scenes, type 500+ words.
4. **AI** — configure an OpenRouter key; test the Nova sidebar with at least three prompts.
5. **Export** — export the project in at least two formats (e.g. Markdown + DOCX).
6. **Backup & Restore** — trigger a manual backup, then restore it.
7. **Report** — file a GitHub Issue for every bug, friction point, or missing feature.

## Feedback Channels

- **GitHub Issues** — primary channel. Use the `beta-feedback` label.
- **Discussions** — for open-ended questions or feature suggestions.
- Do not share beta builds publicly.

## Known V1 Limitations

- No cloud sync or account system (by design — local-first).
- No Scrivener or Word import.
- Linux build is CI-only; official Linux support is post-V1.
- No mobile or tablet support.
- AI context is limited to scene + adjacent scenes; full-manuscript context is post-V1.
- Worldbuilding cross-linking is read-only in V1 (edit UI is post-V1).
- No collaborative editing.

## Pricing-Readiness Checklist

- [ ] Stripe (or payment processor) account created.
- [ ] Founder license tier defined (lifetime 1.x updates, limited seats).
- [ ] Standard license tier defined (all 1.x updates).
- [ ] License key generation and validation mechanism chosen.
- [ ] Pricing page / landing page published.
- [ ] Purchase flow tested end-to-end.
- [ ] License key storage in Novellum confirmed not to conflict with data privacy policy.
