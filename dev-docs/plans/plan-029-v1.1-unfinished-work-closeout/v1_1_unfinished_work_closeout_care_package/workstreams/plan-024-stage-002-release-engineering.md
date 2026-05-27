# Workstream — plan-024 Stage 002 Release Engineering

## Objective

Close release engineering using the existing CI/CD and Tauri bundle setup. Verify, harden, and document the current pipeline. Do not invent a parallel release system.

## Known Current Targets

| Workflow/config | Current target behavior | Confidence |
|---|---|---|
| `desktop-build.yml` | macOS aarch64 DMG | High |
| `desktop-build.yml` | Windows x64 MSI | High |
| `release.yml` | macOS universal-apple-darwin | High |
| `release.yml` | Windows | High |
| `release.yml` | Ubuntu Linux | High |
| `tauri.conf.json` | Bundle config active with all targets | High |

## Acceptance Criteria

- Existing workflows are inspected and documented.
- Tauri bundle config aligns with release matrix.
- Release verification checklist exists.
- Packaged/prod-like manual smoke checklist exists.
- No duplicate release workflow is introduced.

## Validation

```md
- [ ] `desktop-build.yml` inspected.
- [ ] `release.yml` inspected.
- [ ] `tauri.conf.json` inspected.
- [ ] Workflow targets documented.
- [ ] Bundle targets reconciled with workflow matrix.
- [ ] Release trigger behavior documented.
- [ ] Manual smoke checklist added.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm lint:css`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build` if available.
```

## Severity-Rated Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| New workflow duplicates existing pipeline | High | Patch existing workflows only after audit |
| Release target drift | High | Reconcile workflow matrix and `tauri.conf.json` together |
| Web build only, no desktop smoke | Medium | Require packaged/prod-like app smoke checklist |
| Secrets leak into client-visible config | Critical | Audit provider/key boundaries during smoke |
