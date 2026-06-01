# Evidence: Scan Input Context Contract

- Date: 2026-05-31
- Part: `part-001-specify-scan-input-context-contract`
- Scope: Define typed scan input context contract and document allowed/forbidden fields.

## Artifact Created

`src/modules/world-building/services/worldbuild-scan-contract.ts` — typed scan context contract introducing:

- `WorldbuildScanProjectContext` — allowed project metadata subset (projectId, title, genre, logline, synopsis only)
- `SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS` — const array explicitly enumerating forbidden fields (systemPrompt, negativePrompt, coverUrl, targetWordCount, status, stylePresetId, projectType, lastOpenedAt, createdAt, updatedAt)
- `WorldbuildScanCanonContext` — compact canon summary by category (names/titles only, no full entity content)
- `WorldbuildScanContextEnvelope` — combined project + canon context envelope
- `WorldbuildScanRequest` — full typed scan request shape (projectId, domainScope, context, maxProposals)
- `ScanContextSufficiencyResult` — discriminated union result type for context validation
- `checkScanContextSufficiency(project)` — pure function enforcing sufficiency rules (title required, logline/synopsis should warn)
- `buildScanProjectContext(project)` — builder function that extracts only allowed fields from a project record

## Context Discipline Guardrails

The contract enforces:
1. Only `projectId, title, genre, logline, synopsis` from project metadata enter the scan envelope.
2. Canon context contains only identifying fields (names/titles), never full entity content.
3. Missing title → `sufficient: false` (hard block).
4. Missing logline or synopsis → `sufficient: false, missing: ['logline' | 'synopsis']` (soft, caller should warn).
5. `SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS` documents explicitly what must never enter a scan prompt.

## Docs Updated

`dev-docs/03-ai/worldbuild-generation.md` — new "Agentic Scan Context Contract" section added with:
- Allowed vs forbidden context fields table
- `checkScanContextSufficiency` behavior documentation
- Scan request shape code block
- Note that scan results are non-canonical proposals until explicit author accept

## Quality Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm check` | 1 pre-existing ERROR (DomainCounts export missing from +page.ts) | Not introduced by this part; `worldbuild-scan-contract.ts` has no type errors |
| `pnpm lint` | 9 pre-existing errors in WorldBuildingWorkspacePage.svelte (unused vars) | Not introduced by this part |
| `pnpm check:tokens` | PASS — 335 files scanned, 0 violations | |
| `pnpm test` | PASS — 203 files / 1472 tests | |

Pre-existing errors confirmed: the DomainCounts error exists because `+page.ts` was converted to a redirect (plan-034 stage-003, commit 8f3b048) but `+page.svelte` line 14 was not updated to remove the now-gone type import.

## Acceptance Criteria Verification

- [x] Scan context contract is explicit and type-safe — TypeScript interfaces with strict field enumeration
- [x] Context discipline guardrails prevent manuscript-wide over-scoping — forbidden fields const + allowed-only builder function
