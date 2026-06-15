# Contract Risk Map Evidence

Date: 2026-06-12

Input evidence: `stage-001-surface-audit/phase-001-call-site-inventory/part-001-call-site-inventory/evidence/call-site-inventory-evidence-2026-06-12.md`

## Compatibility Decision

Novellum does not persist Nova session messages today; `novaSession` stores messages in memory only. That means there is no durable migration requirement for old `author-outline` artifact cards.

Compatibility strategy:

- Stop supported UI from producing new `author-outline` artifacts.
- Keep any temporary old `author-outline` rendering read-only if needed for already-open sessions.
- Remove the apply action from the old card before disabling the route.
- Hard-disable `/api/nova/outline/apply` with an explicit unsupported response instead of silently deleting it first.

## Risk Map

| Surface | Risk | Disposition | Protection strategy |
| --- | --- | --- | --- |
| Write-mode outline request routing in `chat-service.ts` | Supported outline prompts currently produce legacy `author-outline` artifacts instead of checkpoint records. | Redirect | Stage 002 should route outline intent to the canonical checkpoint generation flow. No supported path should call `runAuthorPipelineTask(AUTHOR_OUTLINE)`. |
| `runAuthorPipelineTask(AUTHOR_OUTLINE)` | Direct callers can still create `author-outline` artifacts. | De-support from UI; decide parser fate later | Keep scene-draft/revision paths. Tests should prove Write mode no longer invokes `AUTHOR_OUTLINE`. Stage 003 can decide whether lower-level parser contracts remain internal or are retired. |
| `NovaOutlineCard.svelte` | Current apply button calls the destructive route. | Read-only fallback or remove | Remove `Apply To Outline` and the service import before route hard-disable. If the card remains for compatibility, it may show counts and JSON copy only. |
| `NovaMessageLog.svelte` `author-outline` branch | Can render the legacy card if a message already exists in the current in-memory session. | Compatibility-only | Keep temporarily only if the card is read-only; otherwise remove branch after Write mode redirect. |
| `outline-artifact-apply.ts` | Single-purpose client wrapper for direct route. | Remove | No canonical flow should use this helper. Deleting it is safe after card apply removal. |
| `/api/nova/outline/apply` route | Replaces existing outline hierarchy outside checkpoint review, conflict, stale, and audit guards. | Hard-disable | Return an explicit unsupported response (recommended `410 Gone` with a checkpoint-flow message) or delete after callers are gone. Tests must assert no hierarchy mutation. |
| `NovaArtifact` `author-outline` type | Keeps legacy artifact shape in public Nova types. | Compatibility-only, then remove | Keep only if old card branch remains. Remove when no code/test references `author-outline`. |
| Nova barrel export for `NovaOutlineCard` | Keeps the legacy card reachable. | Remove or compatibility-only | Remove after active imports are gone; check boundary/lint output. |
| Legacy route tests | Assert the destructive behavior as supported. | Replace | Update to prove disabled behavior and no hierarchy replacement. |
| Artifact-card tests | Assert old apply UI copy. | Replace | Update for read-only card or remove with card deletion. |
| Docs for Write mode outline | Current docs mention `runAuthorPipelineTask(AUTHOR_OUTLINE)` and artifact cards. | Update | Docs sync should say outline generation is checkpoint-only. |

## Recommended Implementation Order

1. Stage 002 / Phase 001: Redirect Write-mode outline intent to checkpoint generation or a deliberate checkpoint-only affordance.
2. Stage 002 / Phase 002: Ensure the visible review surface is `NovaOutlineDraftCheckpointCard`; remove or convert `NovaOutlineCard` to read-only.
3. Stage 002 / Phase 003: Confirm only `acceptOutlineCheckpointMaterialization()` writes outline hierarchy.
4. Stage 003 / Phase 001: Hard-disable `/api/nova/outline/apply`.
5. Stage 003 / Phase 002: Remove legacy card/helper/type/barrel residue once no active caller remains.
6. Stage 003 / Phase 003 and Stage 004: Record compatibility notes, update docs, and run full gates.

## Minimal Regression Set

Use these before and after behavior changes:

- `pnpm test tests/nova/mode-routing.test.ts tests/nova/chat-service.test.ts tests/nova/outline-generation-state.test.ts tests/nova/outline-generation-runner.test.ts`
- `pnpm test tests/nova/NovaOutlineGenerationPanel.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-ux-states.test.ts tests/nova/nova-artifact-cards.test.ts`
- `pnpm test tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-generation.test.ts tests/routes/outline-accept.test.ts tests/routes/outline-no-silent-write-regression.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-checkpoint-audit.test.ts`
- `pnpm test:e2e --grep "outline generation review gate" --project=chromium`

Full closure gates remain:

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`

## Data And Migration Notes

- No durable Nova-message migration is required because `novaSession` is process/browser-session memory, not a persisted message table.
- Existing project outline hierarchy should not be deleted or rewritten by consolidation. Only explicit accepted outline checkpoints should materialize hierarchy.
- If a user has a live in-memory `author-outline` card during upgrade, read-only display plus JSON copy is sufficient; applying must be unavailable.

## Open Reviewer Questions

- Should the unsupported legacy route return `410 Gone` or be deleted entirely after active callers are removed? The risk map recommends `410 Gone` first for clearer failure behavior.
- Should `vibe-author.outline` parser support remain as an internal parser contract, or should Stage 003 remove the task key from `PIPELINE_TASK_KEYS`? The risk map recommends keeping parser removal separate from user-facing consolidation unless tests prove it is dead.
