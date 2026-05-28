# Release Engineering Closeout Matrix

> Generated: 2026-05-27
> Input: release-matrix-audit-2026-05-27.md

## Disposition

**plan-024 stage-002 (Release Engineering): DEFER TO DEDICATED RELEASE PLAN**

### Rationale

Release engineering requires external dependencies (certificate acquisition, vendor onboarding) that cannot be resolved within a closeout umbrella plan. The existing infrastructure (`release.yml`, `desktop-build.yml`) is functional for unsigned builds. Code signing and notarization are genuine pre-release requirements but are blocked on:

1. Apple Developer ID certificate (requires Apple Developer Program enrollment)
2. Windows Authenticode certificate (requires certificate authority purchase)
3. Brand icon artwork (requires design deliverable)

These are not software engineering tasks that can be closed out in a code-centric plan — they require procurement and design decisions.

### Per-task Disposition

| Task | Disposition | Rationale |
|------|------------|-----------|
| task-06 smoke installer | **supersede** | desktop-build.yml CI artifacts validate build; formal smoke can be part of release checklist |
| task-07 keyring verify | **defer** | Requires packaged build on target OS; blocked on signing pipeline |
| task-08 brand icons | **defer** | Requires design deliverable |
| task-09 signing certs | **defer** | Requires external procurement |
| task-10 CI tag dry-run | **execute** | Can be done now with workflow_dispatch dry_run |

### Smoke Matrix

| Check | Method | Platform |
|-------|--------|----------|
| Web build succeeds | `pnpm build` | CI (ubuntu) |
| Desktop build produces DMG | `desktop-build.yml` workflow_dispatch | macOS |
| Desktop build produces MSI | `desktop-build.yml` workflow_dispatch | Windows |
| Validate job passes | `release.yml` workflow_dispatch dry_run | CI |
| App launches from packaged installer | Manual launch test | macOS, Windows |

### Recommended Action

Retire plan-024 stage-002 from closeout scope with rationale: "Release engineering requires external procurement (signing certificates, brand artwork) outside the scope of code-centric closeout. Infrastructure is in place; execution depends on business decisions." Track remaining items as a V1.1 release checklist, not a plan stage.
