# plan-024 Stage 002 Release Engineering Agent Prompt

```md
1. Objective
Close `plan-024` stage-002 release engineering using the existing repo workflows and Tauri config.

2. Problem
Release engineering is deferred. The repo already has desktop and tag-based release workflows, so the task is to verify, harden, document, and reconcile—not invent a second release system.

3. Files
Primary:
- `desktop-build.yml`
- `release.yml`
- `tauri.conf.json`
- release docs
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`

4. Changes
- Inspect existing desktop and release workflows.
- Confirm actual targets match docs.
- Confirm Tauri bundle config aligns with workflow matrix.
- Add/update release verification checklist.
- Add/update manual smoke checklist.
- Avoid unrelated workflow redesign.

5. UI/UX
- No UI changes unless release smoke docs reference existing user flows.

6. Data
- No DB changes.
- No API changes.
- No provider integration changes unless smoke verification exposes a release-blocking issue.

7. Errors
- If a workflow target is unclear, mark `needs repo verification`.
- If build scripts are missing, document exact blocker.

8. Tests
- Run repo quality gates if feasible.
- Verify workflow YAML syntax.
- Run production build locally if supported.
- Document packaged-app smoke expectations.

9. Criteria
- Release workflows documented.
- Tauri targets reconciled.
- Manual smoke checklist exists.
- Trackers updated.
- No duplicate release system introduced.

10. Out-of-scope
- New release platform.
- New updater system.
- Code signing overhaul unless already required by existing docs.
- Feature work.

11. Format
Return:
- Workflow target table.
- Tauri target reconciliation.
- Docs changed.
- Tests/checks run.
- Remaining blockers.
```
