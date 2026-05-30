# Workstream — plan-019 Naming Consistency

## Objective

Align route segments, module folders, and component names to the same domain vocabulary while keeping old URLs reachable through redirects.

This is a pure rename plan. No behavioral changes, schema changes, feature work, or API resource renaming.

## Acceptance Criteria

| Criterion | Required evidence | Confidence |
|---|---|---|
| Canonical vocabulary applied | Route segment, module folder, and component names match agreed domain language | High |
| Old URLs remain reachable | Redirects exist and are smoked/tested | High |
| Imports updated | No stale import paths remain | High |
| Navigation updated | UI links point to canonical routes | High |
| Boundary rules updated | Boundaries check passes | High |
| Mirrored tests updated | Tests reflect canonical paths/names | High |
| Docs updated | Plan/docs references use canonical names and note redirects | High |
| `/api/db` untouched | No API resource path rename under `/api/db` | High |

## Implementation Rules

- Start with `plan.md` and the specific plan-019 artifact.
- Build an old → new naming map before touching files.
- Rename only vocabulary-bearing routes/modules/components.
- Add redirect shims for public legacy routes.
- Update imports, navigation links, tests, boundaries, and docs in the same change set.
- Do not rename `/api/db/*`.
- Do not change behavior.

## Validation

```md
- [ ] Confirm canonical vocabulary.
- [ ] Inventory old names with `rg`.
- [ ] Rename route/module/component names only where required.
- [ ] Add redirects for old public URLs.
- [ ] Update imports.
- [ ] Update navigation.
- [ ] Update boundaries config/rules if affected.
- [ ] Update mirrored tests.
- [ ] Update docs.
- [ ] Confirm `/api/db/*` unchanged.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm lint:css`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test`.
- [ ] Run boundaries check.
- [ ] Smoke old URL → canonical URL redirect.
```

## Severity-Rated Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Renaming `/api/db/*` | Critical | Explicitly exclude API DB resource paths from rename map |
| Mixing behavior with rename | High | Reject any non-rename diff unless required for redirect/import repair |
| Removing old routes without redirects | High | Add redirect shims before deleting old route entries |
| Leaving docs/tests stale | Medium | Require docs/test pass in same PR |
