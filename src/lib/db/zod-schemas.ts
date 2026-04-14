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
