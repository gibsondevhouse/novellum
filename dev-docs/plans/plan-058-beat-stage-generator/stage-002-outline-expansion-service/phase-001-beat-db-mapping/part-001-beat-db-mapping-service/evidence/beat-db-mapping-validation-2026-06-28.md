---
part: part-001-beat-db-mapping-service
captured_at: 2026-06-28
captured_by: Codex
---

# Beat DB Mapping Validation Evidence

## Scope

Stage 002 maps optional scene beat plans into canonical `beats` and `stages` SQLite rows during
outline checkpoint acceptance. Stage 003 owns the outline UI tree for viewing and editing those rows.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm vitest run tests/server/outline/outline-materialization-map.test.ts tests/routes/outline-accept.test.ts tests/ai/pipeline/beat-schema-prompts.test.ts --reporter=dot` | PASS | 3 files / 20 tests |
| `pnpm check` | PASS | 0 errors / 0 warnings |
| `pnpm lint` | PASS | No ESLint failures |

## Coverage Notes

- Materialization map emits deterministic beat/stage IDs from scene id and order.
- Selected scene materialization carries child beat/stage rows with the scene.
- Checkpoint acceptance inserts beats and stages inside the existing SQLite transaction and records
  counts in checkpoint acceptance metadata.
- Cross-project beat/stage ID collisions are checked with the rest of the hierarchy.
