import { PROMPT_SEEDS } from './prompt-library-seeds.js';

export interface PromptScaffold {
	role: string;
	task: string;
	constraints: string[];
	outputFormat: string;
}

/**
 * Resolves a prompt scaffold for a specific pipeline stage.
 * Prefers project-specific overrides from the templates table if available.
 *
 * Design:
 * - If a template of the given type exists and is valid JSON, it is merged over the seed.
 * - If it is NOT valid JSON, its content replaces the 'task' field of the seed.
 * - Otherwise, the seed is returned as-is.
 */
export function resolvePromptScaffold(
	stageKey: string,
	templates: Array<{ type: string; content: string }> = []
): PromptScaffold {
	const seed = PROMPT_SEEDS[stageKey];
	if (!seed) {
		// Fallback for non-pipeline tasks if ever called, but strictly it expects a valid stageKey
		throw new Error(`No prompt seed found for stage: ${stageKey}`);
	}

	const template = templates.find((t) => t.type === stageKey);
	if (template && template.content.trim()) {
		try {
			const override = JSON.parse(template.content);
			// Security: ensure we don't accidentally merge non-scaffold fields if the JSON is wild
			return {
				role: override.role ?? seed.role,
				task: override.task ?? seed.task,
				constraints: Array.isArray(override.constraints) ? override.constraints : seed.constraints,
				outputFormat: override.outputFormat ?? seed.outputFormat
			};
		} catch {
			// If not valid JSON, treat template.content as the 'task' override
			return {
				...seed,
				task: template.content
			};
		}
	}

	return seed;
}
