# plan-030 Global Checklist

## Stage 001 — Context Grounding Contract

- [x] Reproduce current Project Hub blindness bug.
- [x] Confirm current sidepanel context path when `projectId` exists and `activeSceneId` is null.
- [x] Add or formalize compact project summary baseline.
- [x] Ensure project baseline includes title, genre, status, projectType, targetWordCount, logline, synopsis, stylePresetId, updatedAt, counts, and first story frame when available.
- [x] Ensure project baseline is included before scene/outline/world/manuscript scopes.
- [x] Ensure no full manuscript default.
- [x] Add regression test for project with zero scenes.
- [x] Add context disclosure tests.

## Stage 002 — Production Sidepanel UX

- [x] Header hierarchy exposes Nova identity and close action.
- [x] Context/model tray is legible and honest.
- [x] Empty state distinguishes project-attached from no-project state.
- [x] No-key/missing-key states link consistently to AI settings.
- [x] Streaming/aborted/error states are visible and recoverable.
- [x] Attachment affordance is wired or disabled/removed.
- [x] Desktop, constrained, and compact viewport behavior verified.
- [x] User-facing “Copilot” labels replaced with “Nova” unless intentionally retained.

## Stage 003 — Modes and Agentic Workflow Boundaries

- [x] Chat mode is conversational and grounded.
- [x] Scribe mode only advertises supported actions.
- [x] Unsupported Scribe requests produce explicit limitation state.
- [x] Outline-generation path remains pipeline/review-gated.
- [x] Artifact cards remain proposal-only.
- [x] No direct editor/manuscript mutation imports added.

## Stage 004 — Verification, Docs, and Closeout

- [x] Unit tests added/updated.
- [x] Visual tests added/updated.
- [x] Context docs updated.
- [x] Nova module docs updated.
- [x] Tracker snippets prepared.
- [x] Evidence recorded.
- [x] `pnpm run check` passed.
- [x] `pnpm run lint` passed.
- [x] `pnpm run lint:css` passed.
- [x] `pnpm run test` passed.
- [x] `pnpm run test:visual` or targeted visual specs passed.
