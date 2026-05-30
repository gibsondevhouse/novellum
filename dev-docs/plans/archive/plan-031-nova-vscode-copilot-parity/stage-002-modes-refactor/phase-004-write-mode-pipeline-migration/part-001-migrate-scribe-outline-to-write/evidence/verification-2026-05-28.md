# Migrate Scribe Outline to Write — 2026-05-28

## Verification

Outline generation remains reachable through Write mode. Predicate: `isOutlineBuildRequest` matches "build/create/generate/draft/make/design/plan/structure" + "outline/story structure/plot map/chapter plan/chapter outline".

Generated output is a `NovaArtifact` proposal card (`kind: 'author-outline'`). No auto-apply path exists.

## Test Coverage

`tests/nova/mode-routing.test.ts`:
- "write mode + outline request routes to pipeline runner" ✓

## Quality Gates

```
pnpm check → 0 errors
pnpm test → 1310 tests passed
```
