import { z } from 'zod';

export const arcRefSchema = z.object({
	arcId: z.string(),
	arcLabel: z.string().optional(),
	role: z.enum(['primary', 'secondary', 'background']).optional(),
});

export const projectSchema = z.object({
	id: z.string(),
	title: z.string(),
	coverUrl: z.string().optional(),
	genre: z.string(),
	logline: z.string(),
	synopsis: z.string(),
	targetWordCount: z.number(),
	status: z.string(),
	systemPrompt: z.string(),
	negativePrompt: z.string(),
	projectType: z.enum(['novel', 'story', 'collection']).optional(),
	lastOpenedAt: z.string().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const chapterSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	title: z.string(),
	order: z.number(),
	summary: z.string(),
	wordCount: z.number(),
	actId: z.string().optional(),
	arcRefs: z.array(arcRefSchema).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const sceneSchema = z.object({
	id: z.string(),
	chapterId: z.string(),
	projectId: z.string(),
	title: z.string(),
	summary: z.string(),
	povCharacterId: z.string().nullable(),
	locationId: z.string().nullable(),
	timelineEventId: z.string().nullable(),
	order: z.number(),
	content: z.string(),
	wordCount: z.number(),
	notes: z.string().default(''),
	characterIds: z.array(z.string()),
	locationIds: z.array(z.string()),
	arcRefs: z.array(arcRefSchema).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const beatSchema = z.object({
	id: z.string(),
	sceneId: z.string(),
	projectId: z.string(),
	title: z.string(),
	type: z.string(),
	order: z.number(),
	notes: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const characterSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	name: z.string(),
	role: z.string(),
	pronunciation: z.string(),
	aliases: z.array(z.string()),
	diasporaOrigin: z.string(),
	photoUrl: z.string(),
	bio: z.string(),
	faction: z.string(),
	anomalies: z.array(z.string()),
	traits: z.array(z.string()),
	goals: z.array(z.string()),
	flaws: z.array(z.string()),
	arcs: z.array(z.string()),
	notes: z.string(),
	tags: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const locationSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	name: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	kind: z.enum(['realm', 'landmark', '']).optional(),
	realmType: z.enum(['physical', 'metaphysical', 'political', 'hybrid', '']).optional(),
	realityRules: z.string().optional(),
	culturalBaseline: z.string().optional(),
	powerStructure: z.string().optional(),
	conflictPressure: z.string().optional(),
	storyRole: z.string().optional(),
	tone: z.string().optional(),
	realmId: z.string().optional(),
	environment: z.string().optional(),
	notableFeatures: z.array(z.string()).optional(),
	purpose: z.string().optional(),
	activityType: z.string().optional(),
	emotionalTone: z.string().optional(),
	changeOverTime: z.string().optional(),
	landmarkIds: z.array(z.string()).optional(),
	factionIds: z.array(z.string()).optional(),
	characterIds: z.array(z.string()).optional(),
	threadIds: z.array(z.string()).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const loreEntrySchema = z.object({
	id: z.string(),
	projectId: z.string(),
	title: z.string(),
	category: z.string(),
	content: z.string(),
	tags: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const plotThreadSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	title: z.string(),
	description: z.string(),
	status: z.string(),
	relatedSceneIds: z.array(z.string()),
	relatedCharacterIds: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
});
