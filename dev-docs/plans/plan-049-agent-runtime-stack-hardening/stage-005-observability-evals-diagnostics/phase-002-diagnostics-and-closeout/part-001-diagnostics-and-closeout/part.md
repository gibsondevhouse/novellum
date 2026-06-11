---
title: Diagnostics & Closeout
slug: part-001-diagnostics-and-closeout
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-002-diagnostics-and-closeout
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Provide local diagnostics and final verification evidence for the hardened agent runtime stack.

## Scope

**In scope:**

- Add support bundle export for redacted runtime records, diagnostics, migration versions, provider configuration metadata, and recent errors.
- Add user-visible recovery status for failed, cancelled, and retryable runs where required by current UI.
- Update developer and user docs.
- Run final quality gates and targeted e2e validation.

**Out of scope:**

- Automatic remote upload of diagnostics.
- Collecting analytics without explicit user action.
- Expanding frontend coherence beyond runtime status and diagnostics needs.

## Implementation Steps

1. Implement diagnostics export service and API route.
2. Add redaction tests and support bundle fixture checks.
3. Wire minimal UI access where the existing settings or Nova surfaces need diagnostics access.
4. Update docs for runtime behavior, local diagnostics, recovery, and support bundle contents.
5. Run final quality gates and save closeout evidence.

## Files

**Create:**

- `src/lib/server/diagnostics/agent-runtime-diagnostics.ts`
- `src/routes/api/diagnostics/agent-runtime/+server.ts`
- `tests/diagnostics/agent-runtime-diagnostics.test.ts`
- `evidence/diagnostics-and-closeout-2026-06-11.md`
- `evidence/final-quality-gates-2026-06-11.txt`

**Update:**

- `src/modules/settings/components/ApiSettings.svelte`
- `src/modules/nova/components/NovaErrorBoundary.svelte`
- `novellum-docs/user/nova.md`
- `novellum-docs/user/ai-setup.md`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `dev-docs/02-architecture/data-model.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `dev-docs/plans/ACTIVE-PLAN.md`

**Reference:**

- `src/lib/server/backup/build-project-backup.ts`
- `src/lib/server/credentials/credential-service.ts`
- `src/lib/server/credentials/keyring-store.ts`
- `tests/backup/credential-exclusion.test.ts`
- `tests/ai/credential-redaction.test.ts`
- `tests/e2e/settings-ai-key.spec.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`

## Acceptance Criteria

- [ ] Users can export local diagnostics without secrets.
- [ ] Runtime docs explain run ledger, queue, model capabilities, budgets, search, traces, evals, and recovery.
- [ ] Final quality gates and targeted e2e flows are recorded in evidence.

## Edge Cases

- Diagnostics should handle corrupted or partially migrated runtime records.
- Support bundles must avoid raw API keys and should clearly identify redacted fields.

## Notes

Closeout must update tracker files only after reviewer sign-off is real. Do not mark this plan complete mechanically.
