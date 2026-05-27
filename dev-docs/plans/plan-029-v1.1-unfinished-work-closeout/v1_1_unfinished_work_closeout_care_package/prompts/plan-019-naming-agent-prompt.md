# plan-019 Naming Agent Prompt

```md
1. Objective
Complete `plan-019-naming-consistency` as a pure rename closeout task.

2. Problem
Route segments, module folders, component names, imports, navigation, tests, boundary rules, and docs must use the same canonical domain vocabulary. Old public URLs must remain reachable through redirects. No behavior changes are allowed.

3. Files
Primary:
- `plan.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- relevant route folders under `src/routes`
- relevant modules/components under `src/lib`
- tests referencing old names
- boundaries config

Do not modify:
- `/api/db/*` route resource paths except for documentation references if required.

4. Changes
- Read `plan.md` and identify canonical naming.
- Inventory all old/new naming references with `rg`.
- Rename route/module/component names only where required.
- Add SvelteKit 308 redirect shims for old public URLs.
- Update imports, navigation links, docs, mirrored tests, and boundaries references.
- Do not change behavior, UI flows, data schema, API contracts, or storage behavior.

5. UI/UX
- Preserve existing UI behavior.
- Only update visible labels if they are part of canonical vocabulary alignment.

6. Data
- No database migration.
- No API resource rename under `/api/db`.
- No client-side storage changes.

7. Errors
- If canonical vocabulary is ambiguous, stop and mark `needs repo verification`.
- If a route cannot be safely redirected, document the blocker and do not delete the old route.

8. Tests
- Run `pnpm lint`.
- Run `pnpm lint:css`.
- Run `pnpm check`.
- Run `pnpm test`.
- Run boundaries check.
- Add or update redirect coverage if the repo has route tests.
- Smoke old URLs and canonical URLs manually.

9. Criteria
- Canonical route/module/component vocabulary is aligned.
- Old URLs redirect.
- No `/api/db/*` rename.
- No behavioral changes.
- All quality gates pass.
- ACTIVE and MASTER trackers reflect final disposition.

10. Out-of-scope
- Feature additions.
- UI redesign.
- Data model changes.
- API contract changes.
- Pagination changes.

11. Format
Return:
- Summary of files changed.
- Rename map old → new.
- Redirect map old URL → canonical URL.
- Tests run and results.
- Any `needs repo verification` items.
```
