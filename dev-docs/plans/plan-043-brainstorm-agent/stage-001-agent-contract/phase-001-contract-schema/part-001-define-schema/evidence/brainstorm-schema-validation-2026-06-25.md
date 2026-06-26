# Brainstorm Schema Validation - 2026-06-25

## Scope

Implemented the first BrainstormAgent schema contract in `src/lib/ai/types.ts`.

## Contract Added

- `BRAINSTORM_AGENT_SCHEMA_VERSION`
- `BRAINSTORM_PROPOSAL_CATEGORIES`
- `BRAINSTORM_WORLD_BUILD_SEED_TARGETS`
- `BrainstormAgentContextConstraints`
- `BrainstormAgentRequest`
- `BrainstormProposal`
- `BrainstormProposalGroups`
- `BrainstormSession`
- `BRAINSTORM_AGENT_JSON_SCHEMA`
- `BRAINSTORM_AGENT_RESPONSE_FORMAT`

## Validation

```text
pnpm test tests/ai/brainstorm-schema.test.ts
Test Files  1 passed (1)
Tests       4 passed (4)
```

```text
pnpm check
svelte-check found 0 errors and 0 warnings
```

## Notes

The schema keeps proposal output grouped as `premiseVariants`, `thematicThreads`, `genreHooks`, and `protagonistSketches`. Empty arrays are valid so the parser can represent categories where the model could not produce useful seeds. Optional fields such as `confidence`, `worldbuildSeedTarget`, `storyQuestion`, and `tags` support later review-gated worldbuilding prefill without making persistence part of this stage.
