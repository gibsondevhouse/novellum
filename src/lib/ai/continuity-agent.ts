import type { ConsistencyIssue } from '$lib/db/types.js';
import type { AiTask } from './types.js';
import { buildContext } from './context-engine.js';
import { buildPrompt } from './prompt-builder.js';
import { OpenRouterClient } from './openrouter.js';
import { selectModel } from './model-router.js';

interface RawIssue {
	type: string;
	severity: string;
	description: string;
	entityIds?: string[];
}

/**
 * Parses the raw AI text response for a continuity_check task into
 * structured ConsistencyIssue partials (no id/projectId/sceneId/status/timestamps).
 * Returns an empty array on malformed JSON.
 */
export function parseConsistencyIssues(
	rawText: string,
): Omit<ConsistencyIssue, 'id' | 'projectId' | 'sceneId' | 'status' | 'createdAt' | 'updatedAt'>[] {
	const VALID_TYPES = new Set(['timeline', 'character', 'lore', 'plot_thread']);
	const VALID_SEVERITIES = new Set(['warning', 'error']);

	try {
		const jsonStart = rawText.indexOf('[');
		const jsonEnd = rawText.lastIndexOf(']');
		if (jsonStart === -1 || jsonEnd === -1) return [];
		const parsed: unknown = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(item): item is RawIssue =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as RawIssue).type === 'string' &&
					typeof (item as RawIssue).description === 'string',
			)
			.map((item) => ({
				type: VALID_TYPES.has(item.type) ? (item.type as ConsistencyIssue['type']) : 'character',
				severity: VALID_SEVERITIES.has(item.severity)
					? (item.severity as ConsistencyIssue['severity'])
					: 'warning',
				description: item.description,
				entityIds: Array.isArray(item.entityIds) ? item.entityIds : [],
			}));
	} catch {
		return [];
	}
}

/**
 * Executes a continuity check by building the context, fetching from AI,
 * and parsing the structural issues.
 * Throws MissingCredentialsError or general Error if the API request fails.
 */
export async function executeContinuityCheck(
	projectId: string,
	task: AiTask,
): Promise<
	Omit<ConsistencyIssue, 'id' | 'projectId' | 'sceneId' | 'status' | 'createdAt' | 'updatedAt'>[]
> {
	const context = await buildContext(task, projectId);
	const prompt = buildPrompt(task, context);

	const client = new OpenRouterClient();
	const response = await client.complete({
		model: selectModel(task.taskType),
		messages: [{ role: 'system', content: prompt }],
	});

	return parseConsistencyIssues(response.text);
}

