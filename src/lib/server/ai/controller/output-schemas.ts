import { z } from 'zod';

export const controllerTextOutputSchema = z
	.object({
		content: z.string(),
	})
	.strict();

export const controllerToolOutputSchema = z
	.object({
		content: z.string().nullable().optional(),
		tool_calls: z.array(z.unknown()).nullable().optional(),
		finish_reason: z.string(),
	})
	.strict();

export const controllerArtifactRefOutputSchema = z
	.object({
		artifactId: z.string().min(1).optional(),
		checkpointId: z.string().min(1).optional(),
		projectId: z.string().min(1).nullable().optional(),
		status: z.string().min(1),
	})
	.strict();

export const controllerProposalListOutputSchema = z
	.object({
		proposals: z.array(z.unknown()),
	})
	.strict();

export const controllerDraftListOutputSchema = z
	.object({
		drafts: z.array(z.unknown()),
	})
	.strict();

export const CONTROLLER_OUTPUT_SCHEMAS = {
	text_response: controllerTextOutputSchema,
	tool_response: controllerToolOutputSchema,
	artifact_ref: controllerArtifactRefOutputSchema,
	proposal_list: controllerProposalListOutputSchema,
	draft_list: controllerDraftListOutputSchema,
	unknown: z.unknown(),
} as const;

export type ControllerOutputSchemaName = keyof typeof CONTROLLER_OUTPUT_SCHEMAS;

export interface ControllerOutputValidationResult<T = unknown> {
	ok: boolean;
	output?: T;
	issues: Array<{ path: string; message: string }>;
}

export function parseModelOutputContent(raw: string): unknown {
	const trimmed = raw.trim();
	if (!trimmed) return { content: '' };
	try {
		return JSON.parse(trimmed) as unknown;
	} catch {
		return { content: raw };
	}
}

export function validateControllerOutput<T = unknown>(
	schemaName: ControllerOutputSchemaName,
	value: unknown,
): ControllerOutputValidationResult<T> {
	const schema = CONTROLLER_OUTPUT_SCHEMAS[schemaName] ?? CONTROLLER_OUTPUT_SCHEMAS.unknown;
	const result = schema.safeParse(value);
	if (result.success) {
		return { ok: true, output: result.data as T, issues: [] };
	}
	return {
		ok: false,
		issues: result.error.issues.map((issue) => ({
			path: issue.path.length ? issue.path.join('.') : '$',
			message: issue.message,
		})),
	};
}

export const CONTROLLER_JSON_SCHEMAS: Record<ControllerOutputSchemaName, Record<string, unknown> | null> = {
	text_response: {
		type: 'object',
		properties: { content: { type: 'string' } },
		required: ['content'],
		additionalProperties: false,
	},
	tool_response: null,
	artifact_ref: {
		type: 'object',
		properties: {
			artifactId: { type: 'string' },
			checkpointId: { type: 'string' },
			projectId: { type: ['string', 'null'] },
			status: { type: 'string' },
		},
		required: ['status'],
		additionalProperties: false,
	},
	proposal_list: {
		type: 'object',
		properties: { proposals: { type: 'array', items: {} } },
		required: ['proposals'],
		additionalProperties: false,
	},
	draft_list: {
		type: 'object',
		properties: { drafts: { type: 'array', items: {} } },
		required: ['drafts'],
		additionalProperties: false,
	},
	unknown: null,
};
