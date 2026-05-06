/**
 * plan-023 stage-006 phase-002 — Stub tool handlers.
 *
 * Registers the four agentic tool slots with no-op handlers that
 * return `not-yet-supported`. Real implementations land in plan-024
 * (worldbuilding), plan-025 (continuity), plan-026 (outline). The
 * literal placeholder `plan-XXX` is preserved in error strings.
 */

import type { ToolDefinition, ToolHandler } from '../types.js';
import { registerTool } from './tool-registry.js';

function notYetSupported(toolId: string): ToolHandler {
	return async () => ({
		status: 'not-yet-supported',
		output: null,
		error: `Tool ${toolId} is registered but not yet wired (planned for plan-XXX).`,
	});
}

export const STUB_TOOLS: ToolDefinition[] = [
	{
		id: 'worldbuilding.create-character',
		description: 'Create a character entry in the project world bible.',
		inputSchema: {
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string' },
				role: { type: 'string' },
				summary: { type: 'string' },
			},
		},
	},
	{
		id: 'worldbuilding.update-location',
		description: 'Patch fields on an existing location.',
		inputSchema: {
			type: 'object',
			required: ['locationId', 'patch'],
			properties: {
				locationId: { type: 'string' },
				patch: { type: 'object' },
			},
		},
	},
	{
		id: 'continuity.scan-scene',
		description: 'Run a continuity check on the named scene.',
		inputSchema: {
			type: 'object',
			required: ['sceneId'],
			properties: { sceneId: { type: 'string' } },
		},
	},
	{
		id: 'outline.suggest-beat',
		description: 'Suggest a new beat under the named chapter.',
		inputSchema: {
			type: 'object',
			required: ['chapterId'],
			properties: {
				chapterId: { type: 'string' },
				afterBeatId: { type: 'string' },
			},
		},
	},
];

export function registerStubTools(): void {
	for (const def of STUB_TOOLS) registerTool(def, notYetSupported(def.id));
}
