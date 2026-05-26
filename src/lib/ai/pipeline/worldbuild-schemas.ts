import { z } from 'zod';

const trimmedString = z.string().transform((value) => value.trim());

const stringListField = z
	.union([z.array(z.string()), z.string()])
	.transform((value) => (Array.isArray(value) ? value : [value]))
	.transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0));

const candidateAnswerSchema = z.union([trimmedString, z.record(z.string(), z.unknown())]);

const entityRecordSchema = z.record(z.string(), z.unknown());

export const worldbuildPremiseSchema = z
	.object({
		hook: trimmedString,
		genreBlend: trimmedString,
		readerPromise: trimmedString,
		coreConflict: trimmedString,
		worldPressure: trimmedString,
		tone: trimmedString,
		scope: trimmedString,
		nonNegotiables: stringListField,
		openQuestions: stringListField,
	})
	.passthrough();

export const worldbuildWorldspecSchema = z
	.object({
		realityMode: trimmedString,
		environment: trimmedString,
		powerOrder: trimmedString,
		socialOrder: trimmedString,
		scarcity: trimmedString,
		magicOrTechRules: trimmedString,
		taboos: trimmedString,
		ordinaryLifeBaseline: trimmedString,
		conflictEngines: stringListField,
		aestheticAnchors: stringListField,
		questionsForResearch: stringListField,
	})
	.passthrough();

export const worldbuildResearchBriefSchema = z
	.object({
		question: trimmedString,
		whyItMatters: trimmedString,
		candidateAnswers: z
			.union([z.array(candidateAnswerSchema), candidateAnswerSchema])
			.transform((value) => (Array.isArray(value) ? value : [value])),
		selectedRecommendation: trimmedString,
		confidence: z.union([trimmedString, z.number()]).transform((value) => `${value}`.trim()),
		sourceNote: trimmedString,
		canonImpact: trimmedString,
	})
	.passthrough();

export const worldbuildResearchBriefsSchema = z
	.object({
		researchBriefs: z.array(worldbuildResearchBriefSchema),
	})
	.passthrough();

export const worldbuildPopulatedBibleSchema = z
	.object({
		characters: z.array(entityRecordSchema),
		locations: z.array(entityRecordSchema),
		factions: z.array(entityRecordSchema),
		loreEntries: z.array(entityRecordSchema),
		timelineEvents: z.array(entityRecordSchema),
		themes: z.array(entityRecordSchema),
		glossary: z.array(entityRecordSchema),
		relationships: z.array(entityRecordSchema),
	})
	.passthrough();

export type WorldbuildPremise = z.infer<typeof worldbuildPremiseSchema>;
export type WorldbuildWorldspec = z.infer<typeof worldbuildWorldspecSchema>;
export type WorldbuildResearchBrief = z.infer<typeof worldbuildResearchBriefSchema>;
export type WorldbuildResearchBriefs = z.infer<typeof worldbuildResearchBriefsSchema>;
export type WorldbuildPopulatedBible = z.infer<typeof worldbuildPopulatedBibleSchema>;

export type WorldbuildSchemaByOutputFormat = {
	json_worldbuild_premise: typeof worldbuildPremiseSchema;
	json_worldbuild_worldspec: typeof worldbuildWorldspecSchema;
	json_worldbuild_research_briefs: typeof worldbuildResearchBriefsSchema;
	json_worldbuild_populated_bible: typeof worldbuildPopulatedBibleSchema;
};

export const WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT: WorldbuildSchemaByOutputFormat = {
	json_worldbuild_premise: worldbuildPremiseSchema,
	json_worldbuild_worldspec: worldbuildWorldspecSchema,
	json_worldbuild_research_briefs: worldbuildResearchBriefsSchema,
	json_worldbuild_populated_bible: worldbuildPopulatedBibleSchema,
};
