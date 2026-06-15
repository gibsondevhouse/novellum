# Docs Sync Evidence - 2026-06-12

## Summary

Updated user and developer docs for worldbuilding canon diff/merge behavior.

## Docs Updated

- `novellum-docs/user/worldbuilding.md`
  - Describes proposal decisions: create, update, merge, link, and no-op.
  - Describes duplicate matches as advisory evidence.
  - Documents compact acceptance/rejection audit metadata.
- `dev-docs/03-ai/agents-map.md`
  - Documents optional `canonDiff`, author-reviewable decisions, atomic accept behavior, legacy create fallback, duplicate evidence constraints, and audit metadata.
- `dev-docs/03-ai/context-engine.md`
  - Documents context discipline for pending proposals and compact audit records.

## Validation

- `pnpm check` - passed, 0 errors / 0 warnings.
- `rg -n "canonDiff|canon diff|Duplicate candidates|Duplicate matches|audit metadata|field-level|no_op|No-op|legacy create" novellum-docs/user/worldbuilding.md dev-docs/03-ai/agents-map.md dev-docs/03-ai/context-engine.md` - found the expected docs updates.
