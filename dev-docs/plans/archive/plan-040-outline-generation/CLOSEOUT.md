# Plan 040 Closeout — Outline Generation

> Closed: 2026-06-04

## Summary

Plan-040 shipped the review-gated Worldbuild -> Outline bridge:

```text
Worldbuilding context -> Outline proposal -> Nova review -> Explicit accept -> Canon hierarchy
```

Generated outlines are stored as `outlineDraftCheckpoints.v1` pipeline checkpoints and remain non-canonical until accepted. Reject leaves hierarchy untouched. Accept uses a dedicated server route with stale guards, conflict preflight, transaction-backed materialization, rollback-safe failure behavior, and audit metadata.

## Shipped Behavior

- Context readiness blocks low-signal generation before provider calls.
- Prompt output is strict JSON schema and validates as `OutlineDraft`.
- One bounded repair attempt handles schema failures.
- Generation creates a `review` checkpoint and writes no hierarchy rows.
- Nova shows empty, loading, blocked, ready, running, failed, cancelled, review-ready, accepted, rejected, conflict, stale, and rollback-safe states.
- Accept writes `arcs`, `acts`, default `milestones`, `chapters`, `scenes`, and scene intent metadata in one transaction.
- Accept updates checkpoint lifecycle only after materialization succeeds.
- Existing hierarchy rows block accept with `outline_conflict`.
- Stale accept attempts return `stale_checkpoint`.
- Materialization failures roll back and return safe copy without raw SQLite details.
- Plan-038 draft context can read accepted scene intent via `quickIntent`, `quick-intent`, and `clarity` metadata.

## Completion Matrix

| Stage | Status | Notes |
| --- | --- | --- |
| 001 Outline Contract & Checkpoint Storage | complete | Contract, lifecycle helpers, route storage, and metadata no-write tests shipped. |
| 002 Generation Service & Prompt | complete | Sufficiency gate, context packet, prompt/schema, route, and runner shipped. |
| 003 Nova Outline Review Surface | complete | Panel, state store, review card, actions, UX states, browser evidence shipped. |
| 004 Accept Materialization & Conflict Safety | complete | Mapper, dedicated accept route, conflict preflight, stale guard, audit metadata, rollback recovery shipped. |
| 005 Quality Gates, Docs & Closeout | complete | Regression/e2e coverage, full gate evidence, docs sync, and closeout artifacts complete. |

| Phase | Status |
| --- | --- |
| Stage 001 / Phase 001 Discover Existing Contracts | complete |
| Stage 001 / Phase 002 Checkpoint Storage Lifecycle | complete |
| Stage 002 / Phase 001 Context Sufficiency and Assembly | complete |
| Stage 002 / Phase 002 Provider Route and Schema Output | complete |
| Stage 003 / Phase 001 Trigger and State Shell | complete |
| Stage 003 / Phase 002 Review Card and Actions | complete |
| Stage 004 / Phase 001 Hierarchy Mapping and Transaction | complete |
| Stage 004 / Phase 002 Conflict Policy and Audit | complete |
| Stage 005 / Phase 001 Automated and Manual Verification | complete |
| Stage 005 / Phase 002 Docs Sync and Reviewer Closeout | complete |

All parts under those phases are complete with evidence artifacts. See [evidence-map-2026-06-03.md](./evidence-map-2026-06-03.md).

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm check` | Pass: 0 errors / 11 pre-existing warnings |
| `pnpm lint` | Pass |
| `pnpm lint:css` | Waived: known unrelated `IndividualsWorkspaceShell.svelte:183` duplicate `text-align` |
| `pnpm test` | Pass: 237 files / 1722 tests |
| `pnpm check:tokens` | Pass: 347 files / 0 violations |
| targeted e2e | Pass: 2 outline review-gate tests |
| docs sync | Complete |
| manual/reviewer verify | Complete by evidence review |

## Residual Risks

| Risk | Severity | Status |
| --- | --- | --- |
| Existing stylelint duplicate `text-align` in `IndividualsWorkspaceShell.svelte` | Low | Deferred outside plan-040; unrelated to outline generation. |
| Older broad e2e specs use stale checkpoint route shapes if run without targeting | Medium | Documented in quality-gate evidence. Targeted plan-040 e2e passes; legacy e2e cleanup should happen in a separate maintenance plan. |
| No merge/regeneration path for populated outlines | Medium | Intentional V1 limitation. Accept blocks conflicts rather than overwriting or merging. |
| Generated beats/stages are absent | Low | Intentional V1 scope. Materialization preserves seven-layer compatibility by leaving those layers empty. |
| Provider output quality can vary despite schema compliance | Medium | Mitigated by context sufficiency, strict schema, review UI, and explicit author accept. |

No unresolved Critical or High defects remain for plan-040.

## Deferred Work

- Non-destructive merge/diff for existing outlines.
- Regeneration in place for a selected outline branch.
- Explicit beat/stage generation contract.
- Automatic downstream draft initiation after accepted outline, if a future plan defines author controls and provenance.
- Legacy broad e2e checkpoint route refresh outside plan-040.

## Reviewer Sign-Off

Reviewer sign-off entries exist in the final part implementation log and earlier part logs. Closeout approved on 2026-06-04 with documented stylelint waiver and no remaining Critical/High defects.
