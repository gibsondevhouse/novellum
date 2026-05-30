---
title: Add No-Mutation Import Source Contract
slug: part-002-add-no-mutation-import-source-contract
part_number: 2
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-006-agentic-tests-and-source-contracts
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 002 — Add No-Mutation Import Source Contract

## Objective

Add a source-contract test that fails if Nova tool handlers import editor or manuscript mutation paths.

## Scope

**In scope:**

- Add a source-contract test that fails if Nova tool handlers import editor or manuscript mutation paths.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Define forbidden import path patterns for editor mutation, manuscript persistence mutation, and direct SQLite access.
2. Scan Nova tool handler files and registry/router implementation files.
3. Fail with an actionable message naming the offending file and import.
4. Document any allowed read-only repository imports if needed.

## Files

**Create:**

- `tests/nova/no-mutation-imports.test.ts`

**Update:**

- `tests/nova/*`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/services/tool-registry.ts`

## Acceptance Criteria

- [ ] Test fails if a tool handler imports forbidden mutation paths.
- [ ] Proposal tools can still call proposal-generation helpers.
- [ ] Source-contract test is included in normal `pnpm test` coverage.

## Edge Cases

- Avoid brittle string matching that blocks harmless type-only imports unless those imports create boundary drift.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
