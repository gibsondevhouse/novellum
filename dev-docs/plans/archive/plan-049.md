---
title: Release Engineering
slug: plan-049-release-engineering
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
  - plan-048-large-novel-performance
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Deliver the engineering work required to cut the first public release of Novellum as a
signed, notarized desktop application with brand assets. The CI pipeline infrastructure
already exists (`release.yml`, `desktop-build.yml`); this plan executes the remaining
software engineering steps and coordinates the external procurement blockers.

> **Procurement dependency**: Apple Developer ID and Windows Authenticode certificates
> must be obtained before stages 002–003 can execute. This plan can be started (stage 001)
> without them.

## Scope

**In scope:**

- Brand icon set: app icon at all required resolutions for macOS (`.icns`), Windows
  (`.ico`), and Linux (`.png`). Vector source in `src-tauri/icons/`.
- macOS code signing and notarization: `tauri.conf.json` signing config, CI secrets,
  notarization step in `release.yml`.
- Windows Authenticode signing: signtool integration in `desktop-build.yml`.
- `smoke:built` harness expansion: extend from 7 to 12 probes covering the new
  release-critical paths (credential unlock, export, AI proxy, image generation if
  plan-045 is merged).
- CI tag dry-run: `release.yml` triggered on `v*` tags; dry-run mode that builds and
  signs but does not publish, for pre-release verification.
- `CHANGELOG.md` bootstrapped with entries from plans 013–040.
- `novellum-docs/` release notes page for the first public release.

**Out of scope:**

- App Store submission (Mac App Store or Microsoft Store).
- Auto-update mechanism.
- Linux packaging (`.deb`, `.rpm`, AppImage) — deferred to a follow-on release plan.

## Stages

| #   | Stage                                                     | Est. Duration | Blocked on              |
| --- | --------------------------------------------------------- | ------------- | ----------------------- |
| 001 | Brand icons and `tauri.conf.json` icon wiring             | 1d            | Designer deliverable    |
| 002 | macOS signing and notarization CI wiring                  | 1d            | Apple Developer ID cert |
| 003 | Windows Authenticode CI wiring                            | 1d            | Windows cert            |
| 004 | `smoke:built` harness expansion to 12 probes              | 1d            | —                       |
| 005 | CI tag dry-run, CHANGELOG, and release notes              | 1d            | Stages 001–004          |

## Quality Gates

- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass
- [ ] `pnpm smoke:built` — all 12 probes pass on the built artifact
- [ ] `pnpm check:tokens` — zero violations
- [ ] macOS build: signed + notarized; Gatekeeper passes on a clean machine
- [ ] Windows build: signed; SmartScreen warning absent on a clean machine
- [ ] `CHANGELOG.md` entries verified against merged plans

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Apple notarization fails due to entitlements gap | medium | Run notarization in CI against a dev cert first; fix entitlements before the production cert |
| Certificate procurement delays block the plan | high | Stage 001 (icons) and stage 004 (smoke harness) are cert-independent and can be completed while waiting |
| `CHANGELOG.md` entries are inaccurate | low | Generate from git log + plan closure evidence; peer-review before tagging |

## Notes

This is the final plan before `git tag desktop-v1.0.0`. The large-novel performance
harness (plan-048) should be complete and baselines documented before this plan closes,
so the release notes can include honest performance characteristics. Release engineering
is the only plan with external procurement dependencies — start the certificate
procurement process as soon as this plan is promoted from `candidate` to `active`.
