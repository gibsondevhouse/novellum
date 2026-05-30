# Agent Prompt — Stage 003 Modes and Workflow Boundaries

You are implementing Stage 003 of plan-030.

## Objective

Make Nova Chat/Scribe modes honest, bounded, and review-gated.

## Requirements

- Chat mode: grounded conversation, brainstorming, questions, feedback.
- Scribe mode: supported concrete authoring tasks only.
- Unsupported Scribe requests: explicit limitation state, not fake execution.
- Outline generation: route through existing pipeline task path.
- Scene/revision artifacts: proposal-only, no auto-apply.
- Tool-calling: do not expand beyond existing guarded experimental path.

## Files

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/author-pipeline-runner.ts`
- `src/modules/nova/components/NovaOutlineCard.svelte`
- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`
- `src/lib/ai/pipeline/task-catalog.ts`

## Tests

- unsupported Scribe request returns bounded message/state
- outline request routes to pipeline
- generated artifacts do not mutate manuscript/editor state
- Chat mode does not produce prose unless explicitly asked

## Out of Scope

- broad autonomous tool runtime
- editor apply workflow
- new pipeline task families
