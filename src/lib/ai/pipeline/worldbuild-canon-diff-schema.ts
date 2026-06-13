import { z } from 'zod';

export type WorldbuildCanonJsonValue =
	| string
	| number
	| boolean
	| null
	| WorldbuildCanonJsonValue[]
	| { [key: string]: WorldbuildCanonJsonValue };

export const worldbuildCanonJsonValueSchema: z.ZodType<WorldbuildCanonJsonValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(worldbuildCanonJsonValueSchema),
		z.record(z.string(), worldbuildCanonJsonValueSchema),
	]),
);

const nonEmptyString = z.string().trim().min(1);

export const worldbuildCanonDomainSchema = z.enum([
	'personae',
	'atlas',
	'archive',
	'threads',
	'chronicles',
]);

export const worldbuildCanonEntityFamilySchema = z.enum([
	'character',
	'faction',
	'location',
	'lore_entry',
	'plot_thread',
	'timeline_event',
	'theme',
	'glossary_term',
	'character_relationship',
]);

export const worldbuildCanonDecisionSchema = z.enum(['create', 'update', 'merge', 'link', 'no_op']);

export const worldbuildCanonValueTypeSchema = z.enum([
	'string',
	'number',
	'boolean',
	'array',
	'object',
	'null',
	'unknown',
]);

export const worldbuildCanonFieldOperationSchema = z.enum([
	'add',
	'append',
	'remove',
	'replace',
	'retain',
	'link',
]);

export const worldbuildCanonEntityRefSchema = z
	.object({
		family: worldbuildCanonEntityFamilySchema,
		id: nonEmptyString.optional(),
		displayName: nonEmptyString,
		table: nonEmptyString.optional(),
		projectId: nonEmptyString.optional(),
		dedupeKey: nonEmptyString.optional(),
	})
	.strict();

export const worldbuildCanonTargetRefSchema = worldbuildCanonEntityRefSchema.extend({
	id: nonEmptyString,
});

export const worldbuildCanonEvidenceKindSchema = z.enum([
	'exact_key',
	'exact_name',
	'normalized_name',
	'token_overlap',
	'alias',
	'same_faction',
	'same_location',
	'date_overlap',
	'shared_related_id',
	'empty_field',
	'unresolved_reference',
	'manual_review',
]);

export const worldbuildCanonReviewEvidenceSchema = z
	.object({
		kind: worldbuildCanonEvidenceKindSchema,
		label: nonEmptyString,
		detail: nonEmptyString.optional(),
		score: z.number().min(0).max(1).optional(),
		target: worldbuildCanonEntityRefSchema.optional(),
	})
	.strict();

export const worldbuildCanonDuplicateCandidateSchema = z
	.object({
		target: worldbuildCanonTargetRefSchema,
		matchKind: worldbuildCanonEvidenceKindSchema,
		score: z.number().min(0).max(1),
		evidence: z.array(worldbuildCanonReviewEvidenceSchema).min(1),
	})
	.strict();

export const worldbuildCanonFieldDiffSchema = z
	.object({
		fieldPath: nonEmptyString,
		label: nonEmptyString.optional(),
		valueType: worldbuildCanonValueTypeSchema,
		operation: worldbuildCanonFieldOperationSchema,
		before: worldbuildCanonJsonValueSchema,
		after: worldbuildCanonJsonValueSchema,
		proposed: worldbuildCanonJsonValueSchema.optional(),
		evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
	})
	.strict();

export const worldbuildCanonLinkDiffSchema = z
	.object({
		linkType: z.enum([
			'character_relationship',
			'faction_membership',
			'location_membership',
			'plot_thread_reference',
			'timeline_reference',
			'tag_reference',
			'generic',
		]),
		source: worldbuildCanonEntityRefSchema,
		target: worldbuildCanonEntityRefSchema,
		status: nonEmptyString.optional(),
		description: nonEmptyString.optional(),
		evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
	})
	.strict();

const worldbuildCanonDiffBaseSchema = z
	.object({
		diffId: nonEmptyString,
		proposalId: nonEmptyString,
		projectId: nonEmptyString,
		categoryId: worldbuildCanonDomainSchema,
		entityKind: nonEmptyString,
		family: worldbuildCanonEntityFamilySchema,
		generatedAt: nonEmptyString,
		summary: nonEmptyString,
		confidence: z.number().min(0).max(1),
	})
	.strict();

export const worldbuildCanonCreateDiffSchema = worldbuildCanonDiffBaseSchema.extend({
	decision: z.literal('create'),
	target: z.null().default(null),
	fields: z.array(worldbuildCanonFieldDiffSchema).min(1),
	links: z.array(worldbuildCanonLinkDiffSchema).default([]),
	duplicateCandidates: z.array(worldbuildCanonDuplicateCandidateSchema).default([]),
	evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
});

export const worldbuildCanonUpdateDiffSchema = worldbuildCanonDiffBaseSchema.extend({
	decision: z.literal('update'),
	target: worldbuildCanonTargetRefSchema,
	fields: z.array(worldbuildCanonFieldDiffSchema).min(1),
	links: z.array(worldbuildCanonLinkDiffSchema).default([]),
	duplicateCandidates: z.array(worldbuildCanonDuplicateCandidateSchema).default([]),
	evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
});

export const worldbuildCanonMergeDiffSchema = worldbuildCanonDiffBaseSchema.extend({
	decision: z.literal('merge'),
	target: worldbuildCanonTargetRefSchema,
	fields: z.array(worldbuildCanonFieldDiffSchema).min(1),
	links: z.array(worldbuildCanonLinkDiffSchema).default([]),
	duplicateCandidates: z.array(worldbuildCanonDuplicateCandidateSchema).min(1),
	evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
});

export const worldbuildCanonLinkOnlyDiffSchema = worldbuildCanonDiffBaseSchema.extend({
	decision: z.literal('link'),
	target: worldbuildCanonTargetRefSchema.optional(),
	fields: z.array(worldbuildCanonFieldDiffSchema).default([]),
	links: z.array(worldbuildCanonLinkDiffSchema).min(1),
	duplicateCandidates: z.array(worldbuildCanonDuplicateCandidateSchema).default([]),
	evidence: z.array(worldbuildCanonReviewEvidenceSchema).default([]),
});

export const worldbuildCanonNoOpDiffSchema = worldbuildCanonDiffBaseSchema.extend({
	decision: z.literal('no_op'),
	target: worldbuildCanonTargetRefSchema.nullable().default(null),
	fields: z.array(worldbuildCanonFieldDiffSchema).default([]),
	links: z.array(worldbuildCanonLinkDiffSchema).default([]),
	duplicateCandidates: z.array(worldbuildCanonDuplicateCandidateSchema).default([]),
	evidence: z.array(worldbuildCanonReviewEvidenceSchema).min(1),
	reason: nonEmptyString,
});

export const worldbuildCanonDiffSchema = z.discriminatedUnion('decision', [
	worldbuildCanonCreateDiffSchema,
	worldbuildCanonUpdateDiffSchema,
	worldbuildCanonMergeDiffSchema,
	worldbuildCanonLinkOnlyDiffSchema,
	worldbuildCanonNoOpDiffSchema,
]);

export type WorldbuildCanonDomain = z.infer<typeof worldbuildCanonDomainSchema>;
export type WorldbuildCanonEntityFamily = z.infer<typeof worldbuildCanonEntityFamilySchema>;
export type WorldbuildCanonDecision = z.infer<typeof worldbuildCanonDecisionSchema>;
export type WorldbuildCanonEntityRef = z.infer<typeof worldbuildCanonEntityRefSchema>;
export type WorldbuildCanonTargetRef = z.infer<typeof worldbuildCanonTargetRefSchema>;
export type WorldbuildCanonReviewEvidence = z.infer<typeof worldbuildCanonReviewEvidenceSchema>;
export type WorldbuildCanonDuplicateCandidate = z.infer<
	typeof worldbuildCanonDuplicateCandidateSchema
>;
export type WorldbuildCanonFieldDiff = z.infer<typeof worldbuildCanonFieldDiffSchema>;
export type WorldbuildCanonLinkDiff = z.infer<typeof worldbuildCanonLinkDiffSchema>;
export type WorldbuildCanonDiff = z.infer<typeof worldbuildCanonDiffSchema>;

export type WorldbuildCanonDiffParseResult =
	| { ok: true; diff: WorldbuildCanonDiff }
	| { ok: false; code: 'invalid_canon_diff'; details: string[] };

export function parseWorldbuildCanonDiff(value: unknown): WorldbuildCanonDiffParseResult {
	const parsed = worldbuildCanonDiffSchema.safeParse(value);
	if (parsed.success) {
		return { ok: true, diff: parsed.data };
	}
	return {
		ok: false,
		code: 'invalid_canon_diff',
		details: parsed.error.issues.map((issue) => {
			const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
			return `${path}: ${issue.message}`;
		}),
	};
}
