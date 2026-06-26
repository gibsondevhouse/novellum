import { z } from 'zod';
import { MAX_PROMPT_CHARS, NOVA_IDENTITY_BLOCK } from './constants.js';
import {
	BRAINSTORM_AGENT_JSON_SCHEMA,
	BRAINSTORM_AGENT_RESPONSE_FORMAT,
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	BRAINSTORM_PROPOSAL_CATEGORIES,
	BRAINSTORM_WORLD_BUILD_SEED_TARGETS,
	type AiContext,
	type BrainstormAgentRequest,
	type BrainstormProposalCategory,
	type BrainstormSession
} from './types.js';

const MAX_SEED_IDEA_CHARS = 2_000;
const MAX_CONTEXT_TEXT_CHARS = 3_500;

export type BrainstormParseErrorCode =
	| 'missing_json'
	| 'invalid_json'
	| 'schema_validation_failed';

export class BrainstormParseError extends Error {
	readonly code: BrainstormParseErrorCode;
	readonly details?: string[];

	constructor(code: BrainstormParseErrorCode, message: string, details?: string[]) {
		super(message);
		this.name = 'BrainstormParseError';
		this.code = code;
		this.details = details;
	}
}

const brainstormProposalSchemaFor = <Category extends BrainstormProposalCategory>(category: Category) =>
	z
		.object({
			id: z.string().min(1),
			category: z.literal(category),
			title: z.string().min(1).max(120),
			description: z.string().min(1).max(1_200),
			rationale: z.string().min(1).max(600),
			confidence: z.enum(['low', 'medium', 'high']).optional(),
			worldbuildSeedTarget: z.enum(BRAINSTORM_WORLD_BUILD_SEED_TARGETS).optional(),
			storyQuestion: z.string().min(1).max(300).optional(),
			tags: z.array(z.string().min(1)).optional()
		})
		.strip();

const brainstormSessionSchema = z
	.object({
		schemaVersion: z.literal(BRAINSTORM_AGENT_SCHEMA_VERSION),
		seedIdea: z.string().min(1),
		proposals: z
			.object({
				premiseVariants: z.array(brainstormProposalSchemaFor('premise_variant')),
				thematicThreads: z.array(brainstormProposalSchemaFor('thematic_thread')),
				genreHooks: z.array(brainstormProposalSchemaFor('genre_hook')),
				protagonistSketches: z.array(brainstormProposalSchemaFor('protagonist_sketch'))
			})
			.strip()
	})
	.strip();

function truncateText(value: string, maxChars: number): string {
	const trimmed = value.trim();
	if (trimmed.length <= maxChars) return trimmed;
	return `${trimmed.slice(0, maxChars - 32).trimEnd()} [truncated]`;
}

function compactList(values: string[] | undefined): string[] | undefined {
	if (!values || values.length === 0) return undefined;
	return values.map((value) => truncateText(value, 160)).filter(Boolean);
}

function serializeGroundingContext(ctx?: AiContext): Record<string, unknown> {
	if (!ctx) return {};

	return {
		project: ctx.project
			? {
					id: ctx.project.id,
					title: ctx.project.title,
					genre: ctx.project.genre,
					status: ctx.project.status,
					projectType: ctx.project.projectType,
					logline: ctx.project.logline,
					synopsis: ctx.project.synopsis ? truncateText(ctx.project.synopsis, 900) : undefined
				}
			: undefined,
		projectCounts: ctx.projectCounts,
		characters: ctx.characters.slice(0, 8).map((character) => ({
			id: character.id,
			name: character.name,
			role: character.role,
			traits: character.traits,
			goals: character.goals
		})),
		locations: ctx.locations.slice(0, 8).map((location) => ({
			id: location.id,
			name: location.name,
			description: truncateText(location.description, 220)
		})),
		loreEntries: ctx.loreEntries.slice(0, 8).map((entry) => ({
			id: entry.id,
			title: entry.title,
			category: entry.category,
			content: truncateText(entry.content, 260)
		})),
		plotThreads: ctx.plotThreads.slice(0, 8).map((thread) => ({
			id: thread.id,
			title: thread.title,
			status: thread.status,
			description: truncateText(thread.description, 220)
		})),
		themes: ctx.themes?.slice(0, 8).map((theme) => ({
			id: theme.id,
			title: theme.title,
			description: truncateText(theme.description, 220),
			tensionPair: theme.tensionPair
		}))
	};
}

function serializeBrainstormInput(request: BrainstormAgentRequest, ctx?: AiContext): string {
	const payload = {
		schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
		seedIdea: truncateText(request.seedIdea, MAX_SEED_IDEA_CHARS),
		context: request.context
			? {
					...request.context,
					comparableTitles: compactList(request.context.comparableTitles),
					mustInclude: compactList(request.context.mustInclude),
					avoid: compactList(request.context.avoid),
					contentWarningsToAvoid: compactList(request.context.contentWarningsToAvoid)
				}
			: undefined,
		requestedCategories: request.requestedCategories,
		maxProposalsPerCategory: request.maxProposalsPerCategory,
		groundingContext: serializeGroundingContext(ctx)
	};

	return truncateText(JSON.stringify(payload, null, 2), MAX_CONTEXT_TEXT_CHARS);
}

/**
 * Builds the structured BrainstormAgent prompt for a single seed idea.
 */
export function buildBrainstormPrompt(request: BrainstormAgentRequest, ctx?: AiContext): string {
	const contextBody = serializeBrainstormInput(request, ctx);
	const sections = [
		`## ROLE\n${NOVA_IDENTITY_BLOCK}\n\nYou are the Novellum BrainstormAgent. You help authors turn a seed idea into structured creative proposals for review.`,
		[
			'## TASK',
			'Generate creative seeds from the author seed idea.',
			'Return premise variants, thematic threads, genre hooks, and protagonist sketches.',
			'Each output item must be useful as review-gated prefill for later worldbuilding work.'
		].join('\n'),
		`## CONTEXT\n${contextBody}`,
		[
			'## CONSTRAINTS',
			'- Return one JSON object only. No markdown fences and no prose outside the JSON.',
			'- Treat every idea as a proposal, not canon.',
			'- Do not claim anything has been saved, accepted, or applied.',
			'- Preserve the author seed idea and explicit constraints.',
			'- Do not generate manuscript prose.',
			'- Include all four proposal groups, even when a group is empty.',
			'- Use worldbuildSeedTarget only as a prefill hint for a later review-gated form.'
		].join('\n'),
		[
			'## OUTPUT FORMAT',
			`Return a BrainstormSession JSON object with schemaVersion "${BRAINSTORM_AGENT_SCHEMA_VERSION}".`,
			'The completion request should use the exported BRAINSTORM_AGENT_RESPONSE_FORMAT when the selected model supports JSON schema output.',
			'JSON schema:',
			JSON.stringify(BRAINSTORM_AGENT_JSON_SCHEMA, null, 2)
		].join('\n')
	];

	let prompt = sections.join('\n\n');
	if (prompt.length <= MAX_PROMPT_CHARS) return prompt;

	const truncationNote = '[Brainstorm context truncated due to prompt size limit]';
	sections[2] = `## CONTEXT\n${truncateText(contextBody, 1_500)}\n${truncationNote}`;
	prompt = sections.join('\n\n');
	return prompt.length <= MAX_PROMPT_CHARS ? prompt : prompt.slice(0, MAX_PROMPT_CHARS);
}

export function getBrainstormResponseFormat(): typeof BRAINSTORM_AGENT_RESPONSE_FORMAT {
	return BRAINSTORM_AGENT_RESPONSE_FORMAT;
}

function extractJsonObject(rawText: string): string {
	const start = rawText.indexOf('{');
	const end = rawText.lastIndexOf('}');
	if (start === -1 || end === -1 || end < start) {
		throw new BrainstormParseError(
			'missing_json',
			'Brainstorm response did not contain a JSON object.'
		);
	}
	return rawText.slice(start, end + 1);
}

function formatZodIssues(issues: z.ZodIssue[]): string[] {
	return issues.map((issue) => {
		const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
		return `${path}: ${issue.message}`;
	});
}

/**
 * Parses and validates a raw BrainstormAgent model response.
 */
export function parseBrainstormOutput(rawText: string): BrainstormSession {
	let parsed: unknown;
	try {
		parsed = JSON.parse(extractJsonObject(rawText));
	} catch (error) {
		if (error instanceof BrainstormParseError) throw error;
		throw new BrainstormParseError('invalid_json', 'Brainstorm response JSON is malformed.');
	}

	const result = brainstormSessionSchema.safeParse(parsed);
	if (!result.success) {
		throw new BrainstormParseError(
			'schema_validation_failed',
			'Brainstorm response did not match the BrainstormSession schema.',
			formatZodIssues(result.error.issues)
		);
	}

	return result.data;
}

export function isBrainstormProposalCategory(value: string): value is BrainstormProposalCategory {
	return (BRAINSTORM_PROPOSAL_CATEGORIES as readonly string[]).includes(value);
}
