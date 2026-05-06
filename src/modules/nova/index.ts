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

registerStubTools();

export { default as NovaPanel } from './components/NovaPanel.svelte';
export { default as ContextDisclosurePill } from './components/ContextDisclosurePill.svelte';
export { default as ModelPickerDropdown } from './components/ModelPickerDropdown.svelte';
export { default as NovaErrorBoundary } from './components/NovaErrorBoundary.svelte';
export { novaPanel } from './stores/nova-panel.svelte.js';
export { novaSession } from './stores/nova-session.svelte.js';
export type { ContextDisclosureState } from './stores/nova-session.svelte.js';
export { aiSession, AiSessionStore } from './services/ai-session-service.svelte.js';
export { buildRagContext } from './services/context-hooks.js';
export { sendNovaChat, type SendChatInput } from './services/chat-service.js';
export { dispatchTool } from './services/tool-router.js';
export {
	registerTool,
	getTool,
	listTools,
} from './services/tool-registry.js';
export { registerStubTools, STUB_TOOLS } from './services/stub-tools.js';
export { classifyNovaError } from './utils/classify-nova-error.js';
export {
	isNovaAgenticEnabled,
	setNovaAgenticFlag,
} from './services/feature-flags.js';
export {
	createStreamController,
	type StreamController,
} from './services/stream-controller.js';
export type {
	NovaMessage,
	NovaMessageStatus,
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
} from './types.js';
