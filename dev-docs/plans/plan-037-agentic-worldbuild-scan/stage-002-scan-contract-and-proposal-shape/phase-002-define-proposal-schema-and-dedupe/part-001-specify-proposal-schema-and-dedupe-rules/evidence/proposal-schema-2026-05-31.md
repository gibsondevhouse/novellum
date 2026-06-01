# Evidence: Proposal Schema & Dedupe Rules

- Date: 2026-05-31
- Part: `part-001-specify-proposal-schema-and-dedupe-rules`
- Scope: Define proposal record schema, status lifecycle, dedupe key strategy, and audit fields.

## Artifacts Created / Updated

### Created: `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`

Exports:

| Export | Kind | Purpose |
|--------|------|---------|
| `WorldbuildProposalStatus` | type | `pending_review \| accepted \| rejected \| failed_validation` |
| `PROPOSAL_STATUS_ORDER` | const | Lifecycle ordering for validation |
| `isWorldbuildProposalStatus` | function | Narrowing guard |
| `WorldbuildProposalSourceContext` | interface | Compact project context snapshot at scan time (title, genre, logline, synopsisHash) |
| `WorldbuildProposalAcceptance` | interface | Acceptance audit (acceptedAt, acceptedBy, projectionTarget, projectedToCanon) |
| `WorldbuildProposalRejection` | interface | Rejection audit (rejectedAt, rejectedBy, reason) |
| `WorldbuildProposalRecord` | interface | Full proposal record with all required fields |
| `buildProposalDedupeKey` | function | Deterministic key: `{categoryId}:{entityKind}:{normalizedName}` |
| `isDuplicateProposalKey` | function | Exact-match collision check against a key set |
| `MIN_PROPOSAL_CONFIDENCE` | const | 0.2 — minimum confidence threshold |
| `MAX_PROPOSALS_PER_SCAN` | const | 5 — hard ceiling per scan run |
| `clampConfidence` | function | Clamps raw model confidence to [0, 1] |

### Updated: `src/lib/ai/pipeline/checkpoint-contract.ts`

Added `WORLDBUILD_PROPOSAL_OWNER_ID = 'vibe-worldbuild-scan'` constant to allow unambiguous
filtering of agentic scan proposal records from the `project_metadata` table vs existing
domain checkpoint records (`WORLDBUILD_CHECKPOINT_OWNER_ID = 'vibe-worldbuild'`).

### Updated: `dev-docs/03-ai/worldbuild-generation.md`

Added "Agentic Scan Proposal Schema" section covering: status lifecycle, key fields table,
dedupe strategy explanation, and owner ID usage.

## Dedupe Key Design

Format: `{categoryId}:{entityKind}:{normalizedPrimaryIdentifier}`

- All lowercase, whitespace collapsed to single space.
- Collision lookup uses exact string equality against: (1) pending proposals, (2) accepted canon names.
- Semantic near-duplicates outside name-match boundary are surfaced in `reasoningSummary` for manual review — not blocked automatically.
- Out of scope: fuzzy/semantic deduplication at the schema layer.

## Quality Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm check` | 1 pre-existing ERROR (DomainCounts in +page.svelte, unrelated) | 1742 files checked (+1 from new schema file); no new errors |
| `pnpm test` | PASS — 203 files / 1472 tests | |
| `pnpm check:tokens` | PASS — 0 violations | (from previous run, no CSS/tokens in schema files) |

## Acceptance Criteria Verification

- [x] Proposal schema includes provenance, confidence, reason, and audit fields — `WorldbuildProposalRecord` has `sourceContext`, `confidence`, `reasoningSummary`, `acceptance`, `rejection`
- [x] Dedupe rules are deterministic and test-targetable — `buildProposalDedupeKey` is a pure function; `isDuplicateProposalKey` operates on a `ReadonlySet<string>` for easy unit testing
