/**
 * plan-023 stage-004 — Nova module public API.
 *
 * Stage-005 (chat wiring) and stage-006 (tool dispatch) extend these
 * exports without renaming. Consumers must import only from this
 * barrel; deep imports across the module boundary will be rejected by
 * `eslint-plugin-boundaries`.
 *
 * stage-006: registers the four agentic tool stubs at module-load
 * (top-level side effect). `clearTools` is intentionally NOT exported
 * — it exists in `tool-registry.ts` for test hygiene only.
 */

import { registerStubTools } from './services/stub-tools.js';
import { novaSession } from './stores/nova-session.svelte.js';
// plan-031 stage-004: import agent-tools to trigger tool registrations at module-load.
import './services/agent-tools.js';
// plan-045: mutation commands register separately and are never model-callable.
import './services/agent-mutation-tools.js';

registerStubTools();

/**
 * Playwright-only hook:
 * visual regression tests need to seed tool-call/tool-result rows, but
 * preview mode does not expose `/src/*` dynamic imports. Expose a tiny
 * window bridge so tests can write via the real session store.
 */
if (typeof window !== 'undefined') {
	(
		window as Window & {
			__NOVELLUM_NOVA_TEST__?: { session: typeof novaSession };
		}
	).__NOVELLUM_NOVA_TEST__ = { session: novaSession };
}

export { default as NovaPanel } from './components/NovaPanel.svelte';
export { default as ContextDisclosurePill } from './components/ContextDisclosurePill.svelte';
export { default as ContextSidebarDrawer } from './components/ContextSidebarDrawer.svelte';
export { default as ModelPickerDropdown } from './components/ModelPickerDropdown.svelte';
export { default as NovaErrorBoundary } from './components/NovaErrorBoundary.svelte';
export { default as NovaSceneDraftCard } from './components/NovaSceneDraftCard.svelte';
export { default as NovaOutlineGenerationPanel } from './components/NovaOutlineGenerationPanel.svelte';
export { default as NovaOutlineDraftCheckpointCard } from './components/NovaOutlineDraftCheckpointCard.svelte';
export { default as NovaRevisionPackCard } from './components/NovaRevisionPackCard.svelte';
export { default as BrainstormSession } from './components/brainstorm/BrainstormSession.svelte';
export { default as BrainstormInput } from './components/brainstorm/BrainstormInput.svelte';
export { default as ProposalList } from './components/brainstorm/ProposalList.svelte';
export { default as ProposalCard } from './components/brainstorm/ProposalCard.svelte';
export { novaPanel } from './stores/nova-panel.svelte.js';
export { novaSession } from './stores/nova-session.svelte.js';
export { novaMode } from './stores/nova-mode.svelte.js';
export {
	contextControl,
	ContextControlStore,
	estimateContextTokens,
	type ContextControlEntity,
	type ContextControlEntityKind,
	type ContextOverrideState,
} from './stores/context-control.svelte.js';
export type { ContextDisclosureState } from './stores/nova-session.svelte.js';
export {
	outlineGenerationState,
	OutlineGenerationStateStore,
	type OutlineGenerationStateDeps,
	type OutlineGenerationStateStatus,
} from './stores/outline-generation-state.svelte.js';
export { aiSession, AiSessionStore } from './services/ai-session-service.svelte.js';
export { buildRagContext } from './services/context-hooks.js';
export { sendNovaChat, type SendChatInput } from './services/chat-service.js';
export {
	runAuthorPipelineTask,
	type AuthorPipelineRunInput,
	type AuthorPipelineRunResult,
} from './services/author-pipeline-runner.js';
export {
	OUTLINE_GENERATION_ENDPOINT,
	OutlineGenerationRunner,
	createOutlineGenerationRunner,
	type OutlineGenerationRunnerError,
	type OutlineGenerationRunnerFailure,
	type OutlineGenerationRunnerInput,
	type OutlineGenerationRunnerOptions,
	type OutlineGenerationRunnerResult,
	type OutlineGenerationRunnerRunOptions,
	type OutlineGenerationRunnerState,
	type OutlineGenerationRunnerStatus,
	type OutlineGenerationRunnerSuccess,
	type OutlineGenerationRunnerCancellation,
} from './services/outline-generation-runner.js';
export {
	BRAINSTORM_GENERATION_ENDPOINT,
	requestBrainstormGeneration,
	runNovaBrainstormSession,
	type BrainstormGenerationError,
	type BrainstormGenerationFailure,
	type BrainstormGenerationInput,
	type BrainstormGenerationOptions,
	type BrainstormGenerationResult,
	type BrainstormGenerationSuccess,
	type BrainstormGenerationCancellation,
} from './services/brainstorm-generation-runner.js';
export {
	OutlineCheckpointActionError,
	createOutlineCheckpointActions,
	acceptOutlineDraftCheckpointAction,
	rejectOutlineDraftCheckpointAction,
	reviewOutlineDraftCheckpointAction,
	type AcceptOutlineCheckpointActionInput,
	type AcceptOutlineCheckpointActionResult,
	type OutlineCheckpointActionBaseInput,
	type OutlineCheckpointActionDeps,
	type OutlineCheckpointActionResult,
	type OutlineCheckpointActions,
	type RejectOutlineCheckpointActionInput,
	type ReviewOutlineCheckpointActionInput,
} from './services/outline-checkpoint-actions.js';
export {
	NOVA_ARTIFACT_ACTION_OWNER_ID,
	actionRequiresDurableWrite,
	classifyNovaArtifactAction,
	createInsufficientContextResult,
	createNovaArtifactActionResult,
	createNovaArtifactActionTarget,
	createStaleTargetResult,
	type NovaArtifactActionAuditMetadata,
	type NovaArtifactActionClassification,
	type NovaArtifactActionDurability,
	type NovaArtifactActionInput,
	type NovaArtifactActionKind,
	type NovaArtifactActionResult,
	type NovaArtifactActionStatus,
	type NovaArtifactActionTarget,
	type NovaInlineArtifactKind,
} from './services/artifact-action-types.js';
export {
	rejectInlineSceneDraftCheckpoint,
	stageInlineSceneDraftCheckpoint,
	type InlineSceneDraftActionDeps,
	type InlineSceneDraftBaseInput,
	type RejectInlineSceneDraftInput,
	type StageInlineSceneDraftResult,
	type StageInlineSceneDraftResultData,
} from './services/inline-scene-draft-actions.js';
export {
	REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID,
	RevisionPackAcknowledgementError,
	acknowledgeRevisionPackIssue,
	loadRevisionPackAcknowledgements,
	revisionPackAcknowledgementKey,
	type RevisionPackAcknowledgementDeps,
	type RevisionPackAcknowledgementState,
} from './services/revision-pack-acknowledgements.js';
export {
	artifactLifecycleLabel,
	artifactTaskLabel,
	debugMetadataLabel,
	formatArtifactTimestamp,
	formatDebugValue,
	formatSceneDisplayLabel,
} from './services/artifact-display.js';
export { dispatchTool } from './services/tool-router.js';
export { runAgentLoop, MAX_AGENT_STEPS, type AgentLoopInput } from './services/agent-loop.js';
export { registerAgentTools, type ProposalEnvelope } from './services/agent-tools.js';
export { registerAgentMutationTools } from './services/agent-mutation-tools.js';
export {
	registerTool,
	getTool,
	listTools,
	listModelCallableTools,
} from './services/tool-registry.js';
export { registerStubTools, STUB_TOOLS } from './services/stub-tools.js';
export { classifyNovaError } from './utils/classify-nova-error.js';
export {
	validateAttachmentFile,
	validateAttachment,
	MAX_ATTACHMENT_SIZE_BYTES,
	ALLOWED_EXTENSIONS,
	type AttachmentValidationResult,
} from './utils/attachment-validator.js';
export { isNovaAgenticEnabled, setNovaAgenticFlag } from './services/feature-flags.js';
export { createStreamController, type StreamController } from './services/stream-controller.js';
export type {
	NovaArtifact,
	NovaAttachment,
	NovaEntityAttachment,
	NovaEntityKind,
	NovaFileAttachment,
	NovaMessage,
	NovaMessageStatus,
	NovaMode,
	NovaRole,
	NovaErrorType,
	RagContextRequest,
	RagContextResult,
	RagPolicy,
	ToolDefinition,
	ToolHandler,
	ToolInvocation,
	ToolResult,
	ToolStatus,
	WriteSubAction,
} from './types.js';
