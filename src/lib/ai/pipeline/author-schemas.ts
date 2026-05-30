import { z } from 'zod';

const trimmedString = z.string().transform((value) => value.trim());

const stringListField = z
	.union([z.array(z.string()), z.string()])
	.transform((value) => (Array.isArray(value) ? value : [value]))
	.transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0));

const entityRecordSchema = z.record(z.string(), z.unknown());

export const authorPremiseSchema = z
	.object({
		bookHook: trimmedString,
		protagonist: z
			.object({
				name: trimmedString,
				role: trimmedString,
				want: trimmedString,
				need: trimmedString,
				problem: trimmedString,
			})
			.passthrough(),
		antagonistForce: trimmedString,
		coreConflict: trimmedString,
		stakes: trimmedString,
		pivotPromise: trimmedString,
		targetLength: trimmedString,
		comps: stringListField,
		whyThisBook: trimmedString,
	})
	.passthrough();

export const authorOutlineSchema = z
	.object({
		arcs: z.array(entityRecordSchema),
		acts: z.array(entityRecordSchema),
		milestones: z.array(entityRecordSchema).optional().default([]),
		chapters: z.array(entityRecordSchema),
		scenes: z.array(entityRecordSchema),
		beats: z.array(entityRecordSchema).optional().default([]),
	})
	.passthrough();

const severitySchema = z.enum(['critical', 'high', 'medium', 'low']);

const revisionIssueSchema = z
	.object({
		id: trimmedString,
		severity: severitySchema,
		kind: trimmedString,
		location: trimmedString,
		description: trimmedString,
		recommendation: trimmedString,
	})
	.passthrough();

export const authorRevisionPackSchema = z
	.object({
		summary: trimmedString,
		issues: z.array(revisionIssueSchema),
		continuityFixes: z.array(entityRecordSchema).optional().default([]),
		stylisticSuggestions: z.array(entityRecordSchema).optional().default([]),
	})
	.passthrough();

export const authorSceneSidecarSchema = z
	.object({
		sceneId: trimmedString,
		chapterId: trimmedString,
		povCharacterId: trimmedString,
		wordCount: z
			.union([z.number(), z.string()])
			.transform((value) =>
				typeof value === 'number' ? Math.max(0, Math.round(value)) : Math.max(0, parseInt(value, 10) || 0),
			),
		usedCanonRefs: z
			.object({
				characterIds: stringListField.optional().default([]),
				locationIds: stringListField.optional().default([]),
				factionIds: stringListField.optional().default([]),
				loreEntryIds: stringListField.optional().default([]),
			})
			.passthrough()
			.optional()
			.default(() => ({
				characterIds: [],
				locationIds: [],
				factionIds: [],
				loreEntryIds: [],
			})),
		uncertainties: stringListField.optional().default([]),
		continuityRisks: stringListField.optional().default([]),
	})
	.passthrough();

export type AuthorPremise = z.infer<typeof authorPremiseSchema>;
export type AuthorOutline = z.infer<typeof authorOutlineSchema>;
export type AuthorRevisionPack = z.infer<typeof authorRevisionPackSchema>;
export type AuthorSceneSidecar = z.infer<typeof authorSceneSidecarSchema>;
export type AuthorRevisionSeverity = z.infer<typeof severitySchema>;

export type AuthorSchemaByOutputFormat = {
	json_author_premise: typeof authorPremiseSchema;
	json_author_outline: typeof authorOutlineSchema;
	json_author_revision_pack: typeof authorRevisionPackSchema;
};

export const AUTHOR_SCHEMA_BY_OUTPUT_FORMAT: AuthorSchemaByOutputFormat = {
	json_author_premise: authorPremiseSchema,
	json_author_outline: authorOutlineSchema,
	json_author_revision_pack: authorRevisionPackSchema,
};

export const AUTHOR_SEVERITY_ORDER: Record<AuthorRevisionSeverity, number> = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3,
};
