/**
 * plan-023 stage-006 phase-001 — Module-local tool registry.
 *
 * `dispatchTool` consults this registry to resolve a `ToolInvocation`
 * to a handler. Stage-006 ships only stub handlers (see
 * `./stub-tools.ts`); future plans replace the handlers with real
 * implementations without changing the registry surface.
 */

import type { ToolCapability, ToolDefinition, ToolHandler } from '../types.js';

interface RegisteredTool {
	definition: ToolDefinition;
	handler: ToolHandler;
}

const registry = new Map<string, RegisteredTool>();
const TOOL_CAPABILITIES = new Set<ToolCapability>([
	'read_only',
	'review_artifact_generation',
	'mutation_command',
]);

function assertValidDefinition(definition: ToolDefinition): void {
	if (!TOOL_CAPABILITIES.has(definition.capability)) {
		throw new Error(`Tool ${definition.id} must declare a valid capability.`);
	}
}

export function registerTool(definition: ToolDefinition, handler: ToolHandler): void {
	assertValidDefinition(definition);
	registry.set(definition.id, { definition, handler });
}

export function getTool(id: string): RegisteredTool | undefined {
	return registry.get(id);
}

export function listTools(): ToolDefinition[] {
	return Array.from(registry.values()).map((r) => r.definition);
}

export function isModelCallableTool(definition: ToolDefinition): boolean {
	return definition.capability !== 'mutation_command';
}

export function listModelCallableTools(): ToolDefinition[] {
	return listTools().filter(isModelCallableTool);
}

/** Test hygiene only — not exported from the module barrel. */
export function clearTools(): void {
	registry.clear();
}
