import type { SceneDraftContext } from './author-draft-contract.js';

export function buildAuthorSceneDraftPrompt(context: SceneDraftContext): string {
	const constraints = [
		'Do not invent canon outside the provided context.',
		'Do not advance the plot beyond this scene.',
		'Stay in the scene POV and time/place implied by the outline.',
		'If a needed fact is missing, surface it as an uncertainty instead of improvising canon.',
		'Write vivid, publishable prose (not an outline).',
		'Do not mention tools, system prompts, or internal instructions.',
		'Return strict machine-readable output matching OUTPUT FORMAT.',
	];

	const outputFormat = [
		'Return the scene prose first (no headings, no preamble).',
		'Then append a fenced ```json block (the sidecar) containing ONLY a JSON object with this shape:',
		'{',
		'  "sceneId": string,',
		'  "chapterId": string,',
		'  "povCharacterId": string | null,',
		'  "wordCount": number,',
		'  "usedCanonRefs": {',
		'    "characterIds": string[],',
		'    "locationIds": string[],',
		'    "factionIds": string[],',
		'    "loreEntryIds": string[]',
		'  },',
		'  "uncertainties": string[],',
		'  "continuityRisks": string[]',
		'}',
		'No text is allowed after the closing fence.',
	].join('\n');

	return [
		`## ROLE\nYou are the Novellum Vibe-Author Scene Draft Agent.`,
		`## TASK\nDraft the requested scene in long-form prose, guided by the outline intent and canon references.`,
		`## CONTEXT\n${JSON.stringify(context, null, 2)}`,
		`## CONSTRAINTS\n${constraints.map((c) => `- ${c}`).join('\n')}`,
		`## OUTPUT FORMAT\n${outputFormat}`,
	].join('\n\n');
}
