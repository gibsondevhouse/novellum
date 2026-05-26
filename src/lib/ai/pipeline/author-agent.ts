import type { ZodIssue, ZodTypeAny } from 'zod';
import {
	AUTHOR_SCHEMA_BY_OUTPUT_FORMAT,
	AUTHOR_SEVERITY_ORDER,
	authorSceneSidecarSchema,
	type AuthorOutline,
	type AuthorPremise,
	type AuthorRevisionPack,
	type AuthorRevisionSeverity,
	type AuthorSceneSidecar,
} from './author-schemas.js';
import {
	createPipelineArtifactEnvelope,
	type PipelineArtifactEnvelope,
	type PipelineRunRequest,
} from './contracts.js';
import {
	PIPELINE_TASK_KEYS,
	getPipelineTaskDefinition,
	type PipelineTaskDefinition,
} from './task-catalog.js';

export const AUTHOR_PIPELINE_KEYS = [
	PIPELINE_TASK_KEYS.AUTHOR_PREMISE,
	PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
	PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT,
	PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK,
] as const;

export type AuthorTaskKey = (typeof AUTHOR_PIPELINE_KEYS)[number];

export interface AuthorSceneDraftPayload {
	prose: string;
	sidecar: AuthorSceneSidecar;
}

export type AuthorPayloadByTaskKey = {
	[PIPELINE_TASK_KEYS.AUTHOR_PREMISE]: AuthorPremise;
	[PIPELINE_TASK_KEYS.AUTHOR_OUTLINE]: AuthorOutline;
	[PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT]: AuthorSceneDraftPayload;
	[PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK]: AuthorRevisionPack;
};

export type AuthorPayload = AuthorPayloadByTaskKey[AuthorTaskKey];

export type AuthorParseErrorCode =
	| 'unsupported_author_task'
	| 'missing_json_object'
	| 'invalid_json_object'
	| 'schema_validation_failed'
	| 'missing_scene_sidecar'
	| 'missing_scene_prose'
	| 'missing_required_fields';

export interface AuthorParseError {
	code: AuthorParseErrorCode;
	message: string;
	details: string[];
}

export type AuthorParseResult =
	| {
			ok: true;
			taskKey: AuthorTaskKey;
			payload: AuthorPayload;
			rawJson: string;
			fallbackMessage: null;
	  }
	| {
			ok: false;
			taskKey: string;
			error: AuthorParseError;
			rawJson: string | null;
			fallbackMessage: string;
	  };

export type AuthorArtifactResult =
	| {
			ok: true;
			artifact: PipelineArtifactEnvelope<AuthorPayload>;
			parse: Extract<AuthorParseResult, { ok: true }>;
	  }
	| {
			ok: false;
			parse: Extract<AuthorParseResult, { ok: false }>;
	  };

export interface AuthorArtifactBuildRequest
	extends Omit<PipelineRunRequest<AuthorPayload>, 'payload' | 'task'> {
	task: Pick<
		PipelineTaskDefinition,
		'key' | 'family' | 'stage' | 'outputFormat' | 'role' | 'contextPolicy'
	>;
	rawOutput: string;
}

type JsonExtractionResult =
	| { ok: true; rawJson: string; jsonValue: unknown }
	| { ok: false; error: AuthorParseError; rawJson: string | null };

const SIDECAR_FENCE_PATTERN = /```(?:json)?\s*\n([\s\S]*?)\n```/gi;

function formatZodIssues(issues: ZodIssue[]): string[] {
	return issues.map((issue) => {
		const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
		return `${path}: ${issue.message}`;
	});
}

function getFallbackMessage(taskKey: string, code: AuthorParseErrorCode): string {
	switch (code) {
		case 'missing_scene_sidecar':
			return `Scene-draft output for ${taskKey} is missing the required sidecar JSON block. Ask the model to append a fenced \`\`\`json sidecar with sceneId/chapterId/povCharacterId.`;
		case 'missing_scene_prose':
			return `Scene-draft output for ${taskKey} is missing prose. Ask the model to draft the scene before the sidecar block.`;
		case 'missing_required_fields':
			return `Author parser rejected ${taskKey} output because required persistence fields were missing. Ask the model to regenerate with complete IDs.`;
		default:
			return `Author parser could not validate ${taskKey} output. Ask the model to regenerate strict JSON matching the declared OUTPUT FORMAT.`;
	}
}

function parseJsonCandidate(candidate: string):
	| { ok: true; jsonValue: unknown }
	| { ok: false; message: string } {
	try {
		return { ok: true, jsonValue: JSON.parse(candidate) };
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : 'Malformed JSON payload.',
		};
	}
}

function extractJsonObject(rawOutput: string): JsonExtractionResult {
	const trimmed = rawOutput.trim();
	if (!trimmed) {
		return {
			ok: false,
			rawJson: null,
			error: {
				code: 'missing_json_object',
				message: 'Model output is empty.',
				details: ['No content was returned by the model.'],
			},
		};
	}

	const direct = parseJsonCandidate(trimmed);
	if (direct.ok) {
		return { ok: true, rawJson: trimmed, jsonValue: direct.jsonValue };
	}

	const firstBrace = rawOutput.indexOf('{');
	const lastBrace = rawOutput.lastIndexOf('}');
	if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
		return {
			ok: false,
			rawJson: null,
			error: {
				code: 'missing_json_object',
				message: 'No JSON object was found in model output.',
				details: ['Expected an object payload bounded by `{` and `}`.'],
			},
		};
	}

	const extracted = rawOutput.slice(firstBrace, lastBrace + 1).trim();
	const parsed = parseJsonCandidate(extracted);
	if (!parsed.ok) {
		return {
			ok: false,
			rawJson: extracted,
			error: {
				code: 'invalid_json_object',
				message: 'Model output contained JSON-like text that failed to parse.',
				details: [parsed.message],
			},
		};
	}

	return { ok: true, rawJson: extracted, jsonValue: parsed.jsonValue };
}

interface SceneDraftSplit {
	prose: string;
	sidecarJson: string;
}

function splitSceneDraft(
	rawOutput: string,
): { ok: true; split: SceneDraftSplit } | { ok: false; error: AuthorParseError } {
	const matches = [...rawOutput.matchAll(SIDECAR_FENCE_PATTERN)];
	if (matches.length === 0) {
		return {
			ok: false,
			error: {
				code: 'missing_scene_sidecar',
				message: 'Scene-draft output is missing a fenced JSON sidecar block.',
				details: [
					'Expected output to end with a ```json ... ``` block carrying the scene metadata sidecar.',
				],
			},
		};
	}

	const lastMatch = matches[matches.length - 1];
	const sidecarJson = (lastMatch[1] ?? '').trim();
	if (!sidecarJson) {
		return {
			ok: false,
			error: {
				code: 'missing_scene_sidecar',
				message: 'Scene-draft sidecar block is present but empty.',
				details: ['The fenced JSON sidecar must contain the sidecar object.'],
			},
		};
	}

	const matchIndex = lastMatch.index ?? rawOutput.lastIndexOf(lastMatch[0]);
	const prose = rawOutput.slice(0, matchIndex).trim();
	if (!prose) {
		return {
			ok: false,
			error: {
				code: 'missing_scene_prose',
				message: 'Scene-draft output is missing prose before the sidecar.',
				details: ['Scene drafting must emit prose before the fenced sidecar block.'],
			},
		};
	}

	return { ok: true, split: { prose, sidecarJson } };
}

function parseSceneDraft(rawOutput: string): AuthorParseResult {
	const taskKey = PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT;
	const split = splitSceneDraft(rawOutput);
	if (!split.ok) {
		return {
			ok: false,
			taskKey,
			error: split.error,
			rawJson: null,
			fallbackMessage: getFallbackMessage(taskKey, split.error.code),
		};
	}

	const jsonParsed = parseJsonCandidate(split.split.sidecarJson);
	if (!jsonParsed.ok) {
		return {
			ok: false,
			taskKey,
			error: {
				code: 'invalid_json_object',
				message: 'Scene-draft sidecar JSON failed to parse.',
				details: [jsonParsed.message],
			},
			rawJson: split.split.sidecarJson,
			fallbackMessage: getFallbackMessage(taskKey, 'invalid_json_object'),
		};
	}

	const schemaParsed = authorSceneSidecarSchema.safeParse(jsonParsed.jsonValue);
	if (!schemaParsed.success) {
		const details = formatZodIssues(schemaParsed.error.issues);
		const missingRequired = schemaParsed.error.issues.some(
			(issue) =>
				issue.path.length === 1 &&
				(issue.path[0] === 'sceneId' ||
					issue.path[0] === 'chapterId' ||
					issue.path[0] === 'povCharacterId'),
		);
		const code: AuthorParseErrorCode = missingRequired
			? 'missing_required_fields'
			: 'schema_validation_failed';
		return {
			ok: false,
			taskKey,
			error: {
				code,
				message: missingRequired
					? 'Scene-draft sidecar is missing required identifiers (sceneId, chapterId, povCharacterId).'
					: 'Scene-draft sidecar failed schema validation.',
				details,
			},
			rawJson: split.split.sidecarJson,
			fallbackMessage: getFallbackMessage(taskKey, code),
		};
	}

	// Re-validate that the required IDs are non-empty after trim transforms.
	const sidecar = schemaParsed.data;
	const missing: string[] = [];
	if (!sidecar.sceneId) missing.push('sceneId is required for persistence.');
	if (!sidecar.chapterId) missing.push('chapterId is required for persistence.');
	if (!sidecar.povCharacterId) missing.push('povCharacterId is required for persistence.');
	if (missing.length > 0) {
		return {
			ok: false,
			taskKey,
			error: {
				code: 'missing_required_fields',
				message: 'Scene-draft sidecar is missing required identifiers (sceneId, chapterId, povCharacterId).',
				details: missing,
			},
			rawJson: split.split.sidecarJson,
			fallbackMessage: getFallbackMessage(taskKey, 'missing_required_fields'),
		};
	}

	const payload: AuthorSceneDraftPayload = {
		prose: split.split.prose,
		sidecar,
	};

	return {
		ok: true,
		taskKey,
		payload,
		rawJson: split.split.sidecarJson,
		fallbackMessage: null,
	};
}

function sortRevisionIssuesBySeverity(pack: AuthorRevisionPack): AuthorRevisionPack {
	const sortedIssues = [...pack.issues].sort((a, b) => {
		const aRank = AUTHOR_SEVERITY_ORDER[a.severity as AuthorRevisionSeverity];
		const bRank = AUTHOR_SEVERITY_ORDER[b.severity as AuthorRevisionSeverity];
		return aRank - bRank;
	});
	return { ...pack, issues: sortedIssues };
}

function parseStructuredAuthorTask(
	task: Pick<PipelineTaskDefinition, 'key' | 'outputFormat'>,
	rawOutput: string,
): AuthorParseResult {
	const extraction = extractJsonObject(rawOutput);
	if (!extraction.ok) {
		return {
			ok: false,
			taskKey: task.key,
			error: extraction.error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, extraction.error.code),
		};
	}

	const schema = AUTHOR_SCHEMA_BY_OUTPUT_FORMAT[
		task.outputFormat as keyof typeof AUTHOR_SCHEMA_BY_OUTPUT_FORMAT
	] as ZodTypeAny | undefined;
	if (!schema) {
		const error: AuthorParseError = {
			code: 'unsupported_author_task',
			message: `No author schema is registered for output format ${task.outputFormat}.`,
			details: ['Only canonical author output formats are supported.'],
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	const parsed = schema.safeParse(extraction.jsonValue);
	if (!parsed.success) {
		const error: AuthorParseError = {
			code: 'schema_validation_failed',
			message: `Output failed schema validation for ${task.outputFormat}.`,
			details: formatZodIssues(parsed.error.issues),
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	let payload = parsed.data as AuthorPayload;
	if (task.key === PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK) {
		payload = sortRevisionIssuesBySeverity(payload as AuthorRevisionPack) as AuthorPayload;
	}

	return {
		ok: true,
		taskKey: task.key as AuthorTaskKey,
		payload,
		rawJson: extraction.rawJson,
		fallbackMessage: null,
	};
}

function parseWithTaskDefinition(
	task: Pick<PipelineTaskDefinition, 'key' | 'outputFormat'>,
	rawOutput: string,
): AuthorParseResult {
	if (!isAuthorTaskKey(task.key)) {
		const error: AuthorParseError = {
			code: 'unsupported_author_task',
			message: `Task key ${task.key} is not an author pipeline stage.`,
			details: [`Expected one of: ${AUTHOR_PIPELINE_KEYS.join(', ')}`],
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: null,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	if (task.key === PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT) {
		return parseSceneDraft(rawOutput);
	}

	return parseStructuredAuthorTask(task, rawOutput);
}

export function parseAuthorOutput(taskKey: string, rawOutput: string): AuthorParseResult {
	const taskDefinition = getPipelineTaskDefinition(taskKey);
	if (!taskDefinition) {
		const error: AuthorParseError = {
			code: 'unsupported_author_task',
			message: `No pipeline task definition exists for ${taskKey}.`,
			details: [`Known author keys: ${AUTHOR_PIPELINE_KEYS.join(', ')}`],
		};
		return {
			ok: false,
			taskKey,
			error,
			rawJson: null,
			fallbackMessage: getFallbackMessage(taskKey, error.code),
		};
	}

	return parseWithTaskDefinition(taskDefinition, rawOutput);
}

export function createAuthorArtifactFromModelOutput(
	request: AuthorArtifactBuildRequest,
): AuthorArtifactResult {
	const parse = parseWithTaskDefinition(request.task, request.rawOutput);
	if (!parse.ok) {
		return { ok: false, parse };
	}

	const artifact = createPipelineArtifactEnvelope({
		...request,
		payload: parse.payload,
		task: request.task,
	});

	return { ok: true, artifact, parse };
}

export function isAuthorTaskKey(taskKey: string): taskKey is AuthorTaskKey {
	return AUTHOR_PIPELINE_KEYS.includes(taskKey as AuthorTaskKey);
}
