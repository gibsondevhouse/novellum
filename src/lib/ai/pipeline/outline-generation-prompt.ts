import type { CompletionRequest } from '../providers/types.js';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_SCENE_INTENT_MAX_LENGTH,
} from './outline-draft-contract.js';
import type { OutlineContextPacket } from './outline-context-builder.js';

export const OUTLINE_GENERATION_PROMPT_VERSION = '1.0.0' as const;
export const OUTLINE_GENERATION_REPAIR_PROMPT_VERSION = '1.0.0' as const;

export const OUTLINE_GENERATION_SECTIONS = [
	'ROLE',
	'TASK',
	'CONTEXT',
	'CONSTRAINTS',
	'OUTPUT FORMAT',
] as const;

export const OUTLINE_GENERATION_CONSTRAINTS = [
	'Generate a proposed outline only; the author must review and accept it before anything becomes canon.',
	'Do not write canonical rows, mutate project hierarchy, edit manuscript text, or imply that changes have been applied.',
	'Use only the provided CONTEXT packet and source references; do not invent facts that contradict or exceed the packet.',
	'Do not include full manuscript prose, scene drafts, provider diagnostics, or internal tool details.',
	'Preserve author agency: label the result as a draft proposal inside summaries and avoid imperative acceptance language.',
	'Every chapter must contain at least one scene.',
	`Every scene must include intent.goal, intent.conflict, intent.turn, and intent.outcome, each ${OUTLINE_SCENE_INTENT_MAX_LENGTH} characters or fewer.`,
	'Return strict JSON only, with no markdown fence, prose preamble, or trailing commentary.',
] as const;

const textSchema = (maxLength: number) => ({
	type: 'string',
	minLength: 1,
	maxLength,
});

const optionalTextSchema = (maxLength: number) => ({
	type: 'string',
	maxLength,
});

const nodeBaseProperties = {
	id: textSchema(128),
	slug: {
		type: 'string',
		minLength: 1,
		maxLength: 128,
		pattern: '^[a-z0-9]+(?:[._-][a-z0-9]+)*$',
	},
	title: textSchema(200),
	order: {
		type: 'integer',
		minimum: 0,
	},
	summary: optionalTextSchema(2000),
} as const;

const sceneIntentSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['goal', 'conflict', 'turn', 'outcome'],
	properties: {
		goal: textSchema(OUTLINE_SCENE_INTENT_MAX_LENGTH),
		conflict: textSchema(OUTLINE_SCENE_INTENT_MAX_LENGTH),
		turn: textSchema(OUTLINE_SCENE_INTENT_MAX_LENGTH),
		outcome: textSchema(OUTLINE_SCENE_INTENT_MAX_LENGTH),
	},
} as const;

const sceneSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['id', 'slug', 'title', 'order', 'summary', 'intent'],
	properties: {
		...nodeBaseProperties,
		intent: sceneIntentSchema,
		povCharacterId: {
			anyOf: [{ type: 'string', maxLength: 128 }, { type: 'null' }],
		},
		characterIds: {
			type: 'array',
			items: textSchema(128),
		},
		locationIds: {
			type: 'array',
			items: textSchema(128),
		},
		plotThreadIds: {
			type: 'array',
			items: textSchema(128),
		},
		targetWordCount: {
			type: 'integer',
			minimum: 1,
		},
	},
} as const;

const chapterSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['id', 'slug', 'title', 'order', 'summary', 'scenes'],
	properties: {
		...nodeBaseProperties,
		scenes: {
			type: 'array',
			minItems: 1,
			items: sceneSchema,
		},
	},
} as const;

const actSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['id', 'slug', 'title', 'order', 'summary', 'chapters'],
	properties: {
		...nodeBaseProperties,
		chapters: {
			type: 'array',
			minItems: 1,
			items: chapterSchema,
		},
	},
} as const;

const arcSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['id', 'slug', 'title', 'order', 'summary', 'purpose', 'acts'],
	properties: {
		...nodeBaseProperties,
		purpose: optionalTextSchema(2000),
		acts: {
			type: 'array',
			minItems: 1,
			items: actSchema,
		},
	},
} as const;

export const OUTLINE_GENERATION_JSON_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['type', 'version', 'schemaVersion', 'id', 'projectId', 'slug', 'title', 'sourceContext', 'arcs'],
	properties: {
		type: { type: 'string', enum: [OUTLINE_DRAFT_ARTIFACT_TYPE] },
		version: { type: 'integer', enum: [OUTLINE_DRAFT_ARTIFACT_VERSION] },
		schemaVersion: { type: 'string', enum: [OUTLINE_DRAFT_SCHEMA_VERSION] },
		id: textSchema(128),
		projectId: textSchema(128),
		slug: nodeBaseProperties.slug,
		title: textSchema(200),
		sourceContext: {
			type: 'object',
			additionalProperties: false,
			required: ['summary', 'includedDomains', 'entityCounts'],
			properties: {
				summary: textSchema(2000),
				includedDomains: {
					type: 'array',
					items: textSchema(80),
				},
				entityCounts: {
					type: 'object',
					additionalProperties: { type: 'integer', minimum: 0 },
				},
				contextHash: optionalTextSchema(128),
				promptVersion: optionalTextSchema(80),
			},
		},
		arcs: {
			type: 'array',
			minItems: 1,
			items: arcSchema,
		},
	},
} as const satisfies Record<string, unknown>;

export const OUTLINE_GENERATION_RESPONSE_FORMAT = {
	type: 'json_schema',
	jsonSchema: {
		name: 'novellum_outline_draft',
		strict: true,
		schema: OUTLINE_GENERATION_JSON_SCHEMA,
	},
} as const satisfies CompletionRequest['responseFormat'];

export interface OutlineGenerationPromptBundle {
	promptVersion: typeof OUTLINE_GENERATION_PROMPT_VERSION;
	prompt: string;
	responseFormat: CompletionRequest['responseFormat'];
}

export interface OutlineGenerationRepairPromptInput {
	contextHash: string;
	validationIssues: Array<{ path: string; message: string }>;
}

function formatConstraints(): string {
	return OUTLINE_GENERATION_CONSTRAINTS.map((constraint) => `- ${constraint}`).join('\n');
}

function formatOutputSchemaSummary(): string {
	return [
		'Return ONLY one JSON object matching the attached response_format JSON schema.',
		'The root object is an OutlineDraft with type/version/schemaVersion/sourceContext/arcs.',
		'Nested hierarchy: arcs[] -> acts[] -> chapters[] -> scenes[].',
		'Every node requires id, slug, title, and order.',
		'Every scene requires intent.goal, intent.conflict, intent.turn, and intent.outcome.',
		'Use stable lowercase slugs and deterministic ids derived from the project/outline labels where possible.',
	].join('\n');
}

export function buildOutlineGenerationPrompt(packet: OutlineContextPacket): OutlineGenerationPromptBundle {
	const promptContext = {
		promptVersion: OUTLINE_GENERATION_PROMPT_VERSION,
		contextHash: packet.contextHash,
		readiness: packet.readiness,
		project: packet.project,
		worldbuilding: packet.worldbuilding,
		sourceReferences: packet.sourceReferences,
		budget: packet.budget,
		warnings: packet.warnings,
	};

	const task = [
		'Create a reviewable outline draft from the provided worldbuilding context.',
		'Two-pass intent to encode in the single JSON result:',
		'1. Structure spine: choose arcs, acts, chapters, and scene order from the grounded context.',
		'2. Scene-intent cards: for every scene, define goal, conflict, turn, and outcome for downstream drafting.',
		'The output remains a proposal checkpoint until the author explicitly accepts it.',
	].join('\n');

	return {
		promptVersion: OUTLINE_GENERATION_PROMPT_VERSION,
		prompt: [
			'## ROLE\nYou are the Novellum Vibe-Author Outline Generation Agent.',
			`## TASK\n${task}`,
			`## CONTEXT\n${JSON.stringify(promptContext, null, 2)}`,
			`## CONSTRAINTS\n${formatConstraints()}`,
			`## OUTPUT FORMAT\n${formatOutputSchemaSummary()}`,
		].join('\n\n'),
		responseFormat: OUTLINE_GENERATION_RESPONSE_FORMAT,
	};
}

export function buildOutlineGenerationRepairPrompt(input: OutlineGenerationRepairPromptInput): string {
	const issueLines =
		input.validationIssues.length > 0
			? input.validationIssues.map((issue) => `- ${issue.path}: ${issue.message}`).join('\n')
			: '- (root): Output did not match the required OutlineDraft schema.';

	return [
		'## ROLE\nYou are the Novellum Vibe-Author Outline Generation Agent repairing one invalid JSON response.',
		'## TASK\nRepair the prior outline JSON so it matches the same response_format schema. This is one bounded retry; do not broaden the story or add new material.',
		`## CONTEXT\nUse the same CONTEXT packet as the original request. Context hash: ${input.contextHash}.`,
		[
			'## CONSTRAINTS',
			'- Fix only schema and validation problems listed below.',
			'- Do not invent new facts, new canon, or new manuscript prose.',
			'- Do not write canonical rows, mutate project hierarchy, or imply acceptance.',
			'- Return strict JSON only, with no markdown fence, preamble, or commentary.',
		].join('\n'),
		`## OUTPUT FORMAT\nReturn ONLY the corrected OutlineDraft JSON object matching the attached response_format schema.\nValidation issues:\n${issueLines}`,
	].join('\n\n');
}
