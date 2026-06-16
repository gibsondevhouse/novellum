import { reviewGateStatusLabel, type ReviewGateStatus } from '$lib/review-gate-labels.js';
import { getPipelineTaskDefinition } from '$lib/ai/pipeline/task-catalog.js';

const TASK_LABELS: Record<string, string> = {
	'vibe-author.outline': 'Outline proposal',
	'vibe-author.scene-draft': 'Scene draft',
	'vibe-author.revision-pack': 'Revision notes',
	'vibe-author.premise': 'Premise proposal',
	'vibe-worldbuild.premise': 'Worldbuilding premise',
	'vibe-worldbuild.worldspec': 'World specification',
	'vibe-worldbuild.research': 'Research brief',
	'vibe-worldbuild.populated-world-bible': 'World bible proposal',
	'vibe-worldbuild.domain.personae': 'People and factions proposal',
	'vibe-worldbuild.domain.atlas': 'Places proposal',
	'vibe-worldbuild.domain.archive': 'Lore proposal',
	'vibe-worldbuild.domain.threads': 'Plot threads proposal',
	'vibe-worldbuild.domain.chronicles': 'Timeline proposal',
};

const DEBUG_LABELS: Record<string, string> = {
	contextHash: 'Context fingerprint',
	promptVersion: 'Prompt version',
	schemaVersion: 'Schema version',
	parserVersion: 'Parser version',
	taskKey: 'Task key',
	model: 'Model',
};

function titleCase(value: string): string {
	return value
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatArtifactTimestamp(value: string | null | undefined): string {
	if (!value?.trim()) return 'Date unavailable';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Date unavailable';
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}

export function artifactTaskLabel(taskKey: string | null | undefined): string {
	const normalized = taskKey?.trim();
	if (!normalized) return 'AI proposal';
	if (TASK_LABELS[normalized]) return TASK_LABELS[normalized];
	const definition = getPipelineTaskDefinition(normalized);
	if (definition) return `${titleCase(definition.stage)} proposal`;
	return `${titleCase(normalized.split('.').at(-1) ?? normalized)} proposal`;
}

export function artifactLifecycleLabel(value: ReviewGateStatus | string | null | undefined): string {
	if (!value?.trim()) return reviewGateStatusLabel('none');
	const normalized = value.trim();
	const knownStatuses: ReviewGateStatus[] = [
		'none',
		'draft',
		'review',
		'pending_review',
		'review-ready',
		'accepted',
		'rejected',
		'failed',
		'failed_validation',
	];
	if (knownStatuses.includes(normalized as ReviewGateStatus)) {
		return reviewGateStatusLabel(normalized as ReviewGateStatus);
	}
	return titleCase(value);
}

export function formatSceneDisplayLabel(input: {
	title?: string | null;
	id?: string | null;
	fallback?: string;
}): string {
	const title = input.title?.trim();
	if (title) return title;
	const id = input.id?.trim();
	if (!id) return input.fallback ?? 'Untitled scene';
	const compact = id.length > 8 ? id.slice(0, 8) : id;
	return `${input.fallback ?? 'Untitled scene'} ${compact}`;
}

export function debugMetadataLabel(key: string): string {
	return DEBUG_LABELS[key] ?? titleCase(key);
}

export function formatDebugValue(value: unknown): string {
	if (value === null || value === undefined) return 'Not recorded';
	if (typeof value === 'string') return value.trim() || 'Not recorded';
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	return JSON.stringify(value);
}
