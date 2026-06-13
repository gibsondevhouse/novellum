# Duplicate Evidence Evidence

Date: 2026-06-12
Part: `part-001-duplicate-evidence`

## Implemented Behavior

Updated `src/lib/ai/pipeline/worldbuild-proposal-schema.ts` with:

- `WorldbuildProposalDuplicateCandidate`
- `WorldbuildProposalDuplicateEvidence`
- `WorldbuildProposalDuplicateMatchKind`
- `MIN_DUPLICATE_EVIDENCE_SCORE`
- `buildProposalDuplicateCandidates`

Updated `src/routes/api/worldbuilding/scan/+server.ts` so scan proposals attach advisory `duplicateCandidates` from existing canon identifiers. Pending proposal duplicates and duplicates inside the same scan batch are still suppressed to avoid repeated pending review cards. Existing canon overlaps are no longer silently blocked by scan persistence; they are surfaced for author review.

## Matching Rules

- Exact normalized dedupe key match: `matchKind: 'exact_key'`, score `1`.
- Token-overlap near match: `matchKind: 'token_overlap'`, score from shared tokens divided by the larger token set.
- Default minimum evidence score: `0.5`.
- Returned candidates are sorted by score and capped, defaulting to 3 candidates.
- Candidate scores are advisory review evidence, not automatic merge or rejection decisions.

## Validation

Command:

```bash
pnpm vitest run tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts tests/ai/pipeline/worldbuild-duplicate-evidence.test.ts tests/routes/worldbuilding-scan.test.ts tests/world-building/worldbuild-scan-dedupe.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests       48 passed (48)
```

Command:

```bash
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

Command:

```bash
pnpm exec eslint src/lib/ai/pipeline/worldbuild-canon-diff-schema.ts src/lib/ai/pipeline/checkpoint-service.ts src/lib/ai/pipeline/worldbuild-proposal-schema.ts src/routes/api/worldbuilding/scan/+server.ts tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts tests/ai/pipeline/worldbuild-canon-merge-policy.test.ts tests/ai/pipeline/worldbuild-duplicate-evidence.test.ts tests/routes/worldbuilding-scan.test.ts
```

Result: passed with zero reported errors.

This completes the Stage 002 contract layer: typed diff records, bounded merge policy, and duplicate evidence suitable for UI review.
