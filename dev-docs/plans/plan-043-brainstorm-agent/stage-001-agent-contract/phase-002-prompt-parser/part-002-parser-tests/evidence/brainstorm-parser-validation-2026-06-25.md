# Brainstorm Parser Validation - 2026-06-25

## Scope

Implemented `parseBrainstormOutput()` in `src/lib/ai/brainstorm-agent.ts` and expanded `tests/ai/brainstorm-agent.test.ts` with parser coverage.

## Parser Behavior

- Extracts a JSON object from raw provider text.
- Throws `BrainstormParseError` with `missing_json` when no object is present.
- Throws `BrainstormParseError` with `invalid_json` for malformed JSON.
- Throws `BrainstormParseError` with `schema_validation_failed` and Zod issue details for invalid BrainstormSession payloads.
- Accepts empty proposal arrays.
- Strips unknown root/proposal fields rather than leaking model-only metadata into typed UI state.
- Enforces the category discriminant for each group.

## Validation

```text
pnpm test tests/ai/brainstorm-agent.test.ts tests/ai/brainstorm-schema.test.ts tests/ai/task-resolver.test.ts tests/ai/model-capabilities.test.ts
Test Files  4 passed (4)
Tests       48 passed (48)
```

```text
pnpm exec vitest run tests/ai/brainstorm-agent.test.ts --coverage.enabled true --coverage.include src/lib/ai/brainstorm-agent.ts --coverage.thresholds.lines 90
Test Files  1 passed (1)
Tests       13 passed (13)
Lines       93.87%
```

```text
pnpm check
svelte-check found 0 errors and 0 warnings
```

```text
pnpm lint
eslint .
```

```text
pnpm test
Test Files  300 passed (300)
Tests       2056 passed (2056)
```

## Notes

This part remains parser-only. No UI, persistence, acceptance flow, or worldbuilding mutation behavior was added here.
