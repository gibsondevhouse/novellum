---
part: part-001-beat-schema-prompts-definition
captured_at: 2026-06-28
captured_by: Codex
---

# Beat Schema Prompts Validation Evidence

## Scope

Stage 001 registered the `vibe-outline.beats` pipeline key, prompt seed, output descriptor, and
strict Zod schemas for scene beat plans with nested stages. Database materialization remains Stage
002 scope.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm vitest run tests/ai/pipeline/beat-schema-prompts.test.ts --reporter=dot` | PASS | 1 file / 3 tests |
| `pnpm check` | PASS | 0 errors / 0 warnings |
| `pnpm lint` | PASS | No ESLint failures |

## Coverage Notes

- Valid beat plans parse with trimmed scene IDs, numeric order coercion, and default stage status.
- Overlong beat arrays are rejected before materialization.
- Prompt seed, task catalog, output descriptor, and schema registry all resolve the same
  `vibe-outline.beats` contract.
