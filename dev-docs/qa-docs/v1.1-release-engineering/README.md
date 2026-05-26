# V1.1 Release Engineering — Human Runbooks

These five tasks (06–10) are the operational, human-required steps to
actually ship a signed, notarized, public Novellum release. They were
originally tracked under `dev-docs/qa-docs/task-06..10/` for the V1
ship gate and are now grouped under V1.1 release engineering
(formerly [plan-024 stage-002 Release Engineering](../../plans/archive/plan-024-v1-final-mile/stage-002-release-engineering/stage.md),
status `deferred-to-v1.1`).

| #   | Task                              | Why it needs a human                                                          |
| --- | --------------------------------- | ----------------------------------------------------------------------------- |
| 06  | [Smoke Test Installer](./task-06-smoke-test-installer/checklist.md) | Install `.dmg` on a clean machine, complete the end-user journey.             |
| 07  | [Verify Keyring](./task-07-verify-keyring/checklist.md)             | Observe the macOS Keychain prompt; confirm no plaintext credentials.          |
| 08  | [Brand Icons](./task-08-brand-icons/checklist.md)                    | Designer-supplied 1024×1024 source PNG; agent regenerates the set.            |
| 09  | [Signing Certs](./task-09-signing-certs/checklist.md)                | Procurement — Apple Developer enrollment, code-signing cert. 1–4 weeks lead.  |
| 10  | [CI + Tag First Release](./task-10-ci-and-tag/checklist.md)          | Push secrets to GitHub Actions, tag `v1.0.0`, download installers.            |

## Execution order

1. **09** first (longest lead time, runs in parallel with everything else).
2. **04, 05** (in [`../completed/`](../completed/)) validate the packaged build — already done.
3. **06, 07, 08** require the packaged build from 04.
4. **10** last, once 09 delivers the certs.

## Why this is deferred-to-v1.1

The V1 ship gate (47/47 DoD, closed 2026-05-26) validated the code,
the CI/CD pipeline, and the release workflow (workflow_dispatch
dry-run passed). What remains is wall-clock work — Apple Developer
procurement, manual smoke on physical hardware, and secrets
provisioning — which the V1 ship gate explicitly excluded.

The `release.yml` workflow is wired and proven. The moment certs +
secrets arrive, Task 10 is a tag push.
