# Capability Schema Evidence — 2026-06-11

## Code Contract Added

- Added `ToolCapability` to `src/modules/nova/types.ts` with three capability classes:
  - `read_only`
  - `review_artifact_generation`
  - `mutation_command`
- Added required `capability` metadata to `ToolDefinition`.
- Added runtime validation in `src/modules/nova/services/tool-registry.ts`; `registerTool()` now rejects definitions without a valid capability.

## Product Tool Annotations

- `read_only`: `project.get_summary`, `project.list_scenes`, `project.list_characters`, `project.list_locations`, `project.get_scene`, `authorDraft.get_scene_draft_context`, `authorDraft.list_checkpoints`.
- `review_artifact_generation`: `propose.outline`, `propose.scene_draft`, `authorDraft.generate_scene_draft_checkpoint`.
- `mutation_command`: `authorDraft.accept_checkpoint`, `authorDraft.reject_checkpoint`.

## Test Coverage

- Updated test registrations to declare explicit capabilities.
- Added a registry test that rejects an invalid capability.
- Existing registry, dispatch, agent-loop, and chat-service tests still pass.

## Validation

- `pnpm check` passed with 0 errors / 0 warnings.
- `pnpm lint` passed.
- `pnpm test tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (4 files / 31 tests).

## Follow-Up For Phase 002

Capability metadata exists, but model advertisement still calls `listTools()` directly. The next part should add a model-callable filtering API and route `runAgentLoop()` plus the experimental agentic chat payload through that filter.
