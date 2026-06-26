# Brainstorm Prompt Builder Validation - 2026-06-25

## Scope

Implemented the BrainstormAgent prompt-building path for plan-043 Stage 001 Phase 002 Part 001.

## Files

- `src/lib/ai/brainstorm-agent.ts`
- `src/lib/ai/types.ts`
- `src/lib/ai/constants.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/model-capabilities.ts`
- `src/lib/ai/index.ts`
- `tests/ai/brainstorm-agent.test.ts`
- `tests/ai/task-resolver.test.ts`
- `tests/ai/model-capabilities.test.ts`

## Prompt Shape

Sample prompt generation is covered by `tests/ai/brainstorm-agent.test.ts`. The generated prompt contains:

```text
## ROLE
...
You are the Novellum BrainstormAgent. You help authors turn a seed idea into structured creative proposals for review.

## TASK
Generate creative seeds from the author seed idea.
Return premise variants, thematic threads, genre hooks, and protagonist sketches.

## CONTEXT
{
  "schemaVersion": "1.0.0",
  "seedIdea": "A cartographer notices the coastline changes whenever someone lies in court.",
  "context": {
    "genre": "fantasy mystery",
    "tone": "quiet dread"
  }
}

## CONSTRAINTS
- Return one JSON object only. No markdown fences and no prose outside the JSON.
- Treat every idea as a proposal, not canon.
- Do not claim anything has been saved, accepted, or applied.

## OUTPUT FORMAT
Return a BrainstormSession JSON object with schemaVersion "1.0.0".
JSON schema:
...
```

## Validation

```text
pnpm test tests/ai/brainstorm-agent.test.ts tests/ai/brainstorm-schema.test.ts tests/ai/task-resolver.test.ts tests/ai/model-capabilities.test.ts
Test Files  4 passed (4)
Tests       39 passed (39)
```

```text
pnpm check
svelte-check found 0 errors and 0 warnings
```

```text
pnpm lint
eslint .
```

## Notes

`brainstorm` is now a first-class `TaskType` with `worldbuilding_scope`, `json_brainstorm_session`, and JSON-schema model capability requirements. The new helper intentionally does not parse, save, accept, or mutate brainstorm output; parser/runtime validation is the next part.
