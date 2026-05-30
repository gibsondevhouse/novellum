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

const characterDraftSchema = z
	.object({
		name: trimmedString,
		role: trimmedString.optional().default(''),
		bio: trimmedString.optional().default(''),
		faction: trimmedString.optional().default(''),
		traits: stringListField.optional().default([]),
		goals: stringListField.optional().default([]),
		flaws: stringListField.optional().default([]),
		tags: stringListField.optional().default([]),
		notes: trimmedString.optional().default(''),
	})
	.strict();

const factionDraftSchema = z
	.object({
		name: trimmedString,
		type: trimmedString.optional().default(''),
		description: trimmedString.optional().default(''),
		mission: trimmedString.optional().default(''),
		ideology: trimmedString.optional().default(''),
	})
	.strict();

const loreEntryDraftSchema = z
	.object({
		title: trimmedString,
		category: trimmedString.optional().default(''),
		content: trimmedString.optional().default(''),
		tags: stringListField.optional().default([]),
	})
	.strict();

const plotThreadDraftSchema = z
	.object({
		title: trimmedString,
		description: trimmedString.optional().default(''),
		status: trimmedString.optional().default(''),
		relatedSceneIds: stringListField.optional().default([]),
		relatedCharacterIds: stringListField.optional().default([]),
	})
	.strict();

const timelineEventDraftSchema = z
	.object({
		title: trimmedString,
		description: trimmedString.optional().default(''),
		date: trimmedString.optional().default(''),
		relatedCharacterIds: stringListField.optional().default([]),
		relatedSceneIds: stringListField.optional().default([]),
	})
	.strict();

export const worldbuildDomainPersonaeSchema = z
	.object({
		individuals: z.array(characterDraftSchema).optional().default([]),
		factions: z.array(factionDraftSchema).optional().default([]),
		relationships: z
			.array(
				z
					.object({
						source: trimmedString,
						target: trimmedString,
						type: trimmedString.optional().default(''),
						description: trimmedString.optional().default(''),
					})
					.strict(),
			)
			.optional()
			.default([]),
	})
	.strict();

export const worldbuildDomainAtlasSchema = z
	.object({
		realms: z
			.array(
				z
					.object({
						name: trimmedString,
						description: trimmedString.optional().default(''),
						tags: stringListField.optional().default([]),
					})
					.strict(),
			)
			.optional()
			.default([]),
		landmarks: z
			.array(
				z
					.object({
						name: trimmedString,
						description: trimmedString.optional().default(''),
						tags: stringListField.optional().default([]),
					})
					.strict(),
			)
			.optional()
			.default([]),
		travelConstraints: z
			.array(z.object({ description: trimmedString }).strict())
			.optional()
			.default([]),
	})
	.strict();

export const worldbuildDomainArchiveSchema = z
	.object({
		myths: z.array(loreEntryDraftSchema).optional().default([]),
		traditions: z.array(loreEntryDraftSchema).optional().default([]),
		technologies: z.array(loreEntryDraftSchema).optional().default([]),
		themes: z
			.array(
				z
					.object({
						title: trimmedString,
						description: trimmedString.optional().default(''),
						tensionPair: trimmedString.optional().default(''),
						imagery: trimmedString.optional().default(''),
					})
					.strict(),
			)
			.optional()
			.default([]),
		glossaryTerms: z
			.array(
				z
					.object({
						term: trimmedString,
						definition: trimmedString.optional().default(''),
						pronunciation: trimmedString.optional().default(''),
						category: trimmedString.optional().default(''),
					})
					.strict(),
			)
			.optional()
			.default([]),
	})
	.strict();

export const worldbuildDomainThreadsSchema = z
	.object({
		majorArcs: z.array(plotThreadDraftSchema).optional().default([]),
		subplots: z.array(plotThreadDraftSchema).optional().default([]),
		motivations: z
			.array(
				z
					.object({
						characterId: trimmedString.optional().default(''),
						characterName: trimmedString,
						drive: trimmedString.optional().default(''),
						conflict: trimmedString.optional().default(''),
					})
					.strict(),
			)
			.optional()
			.default([]),
	})
	.strict();

export const worldbuildDomainChroniclesSchema = z
	.object({
		eras: z
			.array(
				z
					.object({
						name: trimmedString,
						period: trimmedString.optional().default(''),
						description: trimmedString.optional().default(''),
					})
					.strict(),
			)
			.optional()
			.default([]),
		keyEvents: z.array(timelineEventDraftSchema).optional().default([]),
		personalHistories: z.array(timelineEventDraftSchema).optional().default([]),
	})
	.strict();

export type WorldbuildDomainPersonae = z.infer<typeof worldbuildDomainPersonaeSchema>;
export type WorldbuildDomainAtlas = z.infer<typeof worldbuildDomainAtlasSchema>;
export type WorldbuildDomainArchive = z.infer<typeof worldbuildDomainArchiveSchema>;
export type WorldbuildDomainThreads = z.infer<typeof worldbuildDomainThreadsSchema>;
export type WorldbuildDomainChronicles = z.infer<typeof worldbuildDomainChroniclesSchema>;

export type WorldbuildSchemaByOutputFormat = {
	json_worldbuild_premise: typeof worldbuildPremiseSchema;
	json_worldbuild_worldspec: typeof worldbuildWorldspecSchema;
	json_worldbuild_research_briefs: typeof worldbuildResearchBriefsSchema;
	json_worldbuild_populated_bible: typeof worldbuildPopulatedBibleSchema;
	json_worldbuild_domain_personae: typeof worldbuildDomainPersonaeSchema;
	json_worldbuild_domain_atlas: typeof worldbuildDomainAtlasSchema;
	json_worldbuild_domain_archive: typeof worldbuildDomainArchiveSchema;
	json_worldbuild_domain_threads: typeof worldbuildDomainThreadsSchema;
	json_worldbuild_domain_chronicles: typeof worldbuildDomainChroniclesSchema;
};

export const WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT: WorldbuildSchemaByOutputFormat = {
	json_worldbuild_premise: worldbuildPremiseSchema,
	json_worldbuild_worldspec: worldbuildWorldspecSchema,
	json_worldbuild_research_briefs: worldbuildResearchBriefsSchema,
	json_worldbuild_populated_bible: worldbuildPopulatedBibleSchema,
	json_worldbuild_domain_personae: worldbuildDomainPersonaeSchema,
	json_worldbuild_domain_atlas: worldbuildDomainAtlasSchema,
	json_worldbuild_domain_archive: worldbuildDomainArchiveSchema,
	json_worldbuild_domain_threads: worldbuildDomainThreadsSchema,
	json_worldbuild_domain_chronicles: worldbuildDomainChroniclesSchema,
};
