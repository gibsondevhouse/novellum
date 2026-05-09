import { NOVA_MAX_FILE_TEXT_CHARS } from '$lib/ai/context-files.js';
import type { NovaContextMode } from '$lib/ai/nova-context-types.js';

export const DEFAULT_MAX_CONTEXT_CHARS = 100_000;
export const FINAL_TRIM_BUFFER = 96;

export const MODE_BUDGETS: Record<NovaContextMode, number> = {
	off: 0,
	summary: 12_000,
	targeted: 35_000,
	full: 100_000,
};

export interface ContextCaps {
	projectLogline: number;
	projectSynopsis: number;
	chapterSummary: number;
	sceneSummary: number;
	sceneContent: number;
	sceneNotes: number;
	beatNotes: number;
	characterBio: number;
	characterNotes: number;
	locationDescription: number;
	loreContent: number;
	plotDescription: number;
	timelineDescription: number;
	storyFrame: number;
	actPlanningNotes: number;
	arcDescription: number;
	arcPurpose: number;
	milestoneDescription: number;
	writingStyleDescription: number;
	writingStyleExample: number;
	systemPrompt: number;
	chatInstruction: number;
	fileText: number;
}

export const BASE_CAPS: ContextCaps = {
	projectLogline: 900,
	projectSynopsis: 1200,
	chapterSummary: 700,
	sceneSummary: 900,
	sceneContent: 4200,
	sceneNotes: 900,
	beatNotes: 800,
	characterBio: 1200,
	characterNotes: 700,
	locationDescription: 1300,
	loreContent: 1400,
	plotDescription: 1200,
	timelineDescription: 1000,
	storyFrame: 1000,
	actPlanningNotes: 900,
	arcDescription: 1100,
	arcPurpose: 700,
	milestoneDescription: 800,
	writingStyleDescription: 700,
	writingStyleExample: 1000,
	systemPrompt: 1200,
	chatInstruction: 1200,
	fileText: NOVA_MAX_FILE_TEXT_CHARS,
};

export const COMPRESSED_CAPS: ContextCaps = {
	projectLogline: 450,
	projectSynopsis: 700,
	chapterSummary: 350,
	sceneSummary: 500,
	sceneContent: 1800,
	sceneNotes: 380,
	beatNotes: 320,
	characterBio: 650,
	characterNotes: 320,
	locationDescription: 700,
	loreContent: 800,
	plotDescription: 700,
	timelineDescription: 600,
	storyFrame: 520,
	actPlanningNotes: 420,
	arcDescription: 700,
	arcPurpose: 380,
	milestoneDescription: 420,
	writingStyleDescription: 400,
	writingStyleExample: 560,
	systemPrompt: 680,
	chatInstruction: 680,
	fileText: 24_000,
};
