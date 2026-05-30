# Chat and Scribe Contracts Evidence (2026-05-27)

## Files changed
- `src/lib/ai/constants.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/types.ts`
- `tests/ai/prompt-builder.test.ts`
- `tests/nova/chat-service.test.ts`
- `tests/nova/nova-panel-chat.test.ts`

## Behavior delivered
- Chat contract reinforced with explicit prose-gating/proposal language in prompt constraints.
- Chat path remains grounded with project baseline context, validated in service-level tests.
- Scribe now routes only supported outline-generation requests to `runAuthorPipelineTask`.
- Unsupported concrete Scribe requests no longer fall through to fake execution; they render an explicit "Scribe limitation" state with actionable guidance to switch to Chat mode.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts tests/nova/chat-service.test.ts tests/ai/prompt-builder.test.ts`

## Test results
- `6` files / `48` tests passing.

## Known limitations
- Stage-003 phase-002 and phase-003 remain pending.
- Full plan closeout validation (`check`, `lint`, `test`, visual suite aggregate) is deferred to stage-004.
