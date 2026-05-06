/**
 * plan-023 stage-004 — Nova module type surface.
 *
 * Defines the message, tool-call, and RAG-context contracts consumed by
 * `NovaPanel`, `novaSession`, and the service hooks. These types are the
 * stable seam stage-005 (chat wiring) and stage-006 (tool dispatch) will
 * extend without renaming.
 */

export type NovaRole = 'user' | 'nova' | 'system' | 'tool-call' | 'tool-result';

export type NovaMessageStatus =
	| 'pending'
	| 'streaming'
	| 'complete'
	| 'error'
	| 'aborted';

export interface NovaMessage {
	id: string;
	role: NovaRole;
	content: string;
	status: NovaMessageStatus;
	/** ISO8601 timestamp. */
	createdAt: string;
	toolId?: string;
	toolPayload?: unknown;
	error?: string;
}

/* ── Tool-call interfaces (stage-006 wires real dispatch) ───────────── */

export interface ToolDefinition {
	/** Stable identifier, e.g. `editor.insertText`. */
	id: string;
	description: string;
	/** JSONSchema-shaped; typed as `unknown` until stage-006. */
	inputSchema: unknown;
}

export interface ToolInvocation {
	invocationId: string;
	toolId: string;
	input: unknown;
	requestedAt: string;
}

export type ToolStatus =
	| 'pending'
	| 'success'
	| 'error'
	| 'unimplemented'
	| 'not-yet-supported';

export interface ToolResult {
	invocationId: string;
	toolId: string;
	status: ToolStatus;
	output?: unknown;
	error?: string;
	completedAt: string;
}

/**
 * plan-023 stage-006 — Tool handler signature.
 *
 * Handlers return a partial `ToolResult` (status + output + error);
 * the dispatcher fills in `invocationId`, `toolId`, and `completedAt`.
 */
export type ToolHandler = (
	invocation: ToolInvocation,
) => Promise<Pick<ToolResult, 'status' | 'output' | 'error'>>;

/* ── RAG context hook (stage-005 wires ContextEngine) ───────────────── */

import type { AiContext } from '$lib/ai/types.js';

export type RagPolicy = 'scene_plus_adjacent' | 'scene_only' | 'project_summary';

export interface RagContextRequest {
	projectId: string;
	activeSceneId: string | null;
	policy: RagPolicy;
	extraScopes?: string[];
}

export interface RagContextResult {
	contextText: string;
	includedScopes: string[];
	warnings: string[];
	/** plan-023 stage-005 — populated when ContextEngine produces a real
	 * AiContext for `scene_plus_adjacent`. Null when no scene is active. */
	aiContext?: AiContext | null;
}

/* ── Error classification (plan-018 stage-005 phase-005) ────────────── */

export type NovaErrorType =
	| 'rate_limit'
	| 'invalid_key'
	| 'context_too_large'
	| 'network_error'
	| 'unknown';
