import type { AiContext, AiTask } from './types.js';

const MAX_PROMPT_CHARS = 8000;

const CONSTRAINTS_BY_TYPE: Record<string, string[]> = {
	brainstorm: ['Focus on variety and creative breadth', 'Do not write full prose passages'],
	outline: ['Produce structured beat-by-beat output', 'Number each beat'],
	draft: ['Write new prose; do not summarize', 'Match the POV established in the scene context'],
	continue: [
		'Match the existing tone, voice, and pacing exactly',
		'Do not introduce new characters not present in context',
	],
	rewrite: [
		'Preserve all plot events and character actions',
		'Improve sentence rhythm and word choice only',
	],
	continuity_check: [
		'Return a JSON array of issue objects — no prose before or after',
		'Each issue: { "type": "timeline"|"character"|"lore"|"plot_thread", "severity": "warning"|"error", "description": "...", "entityIds": [] }',
		'If no issues found, return an empty array: []',
	],
	summarize: [
		'Be faithful to the source text — no additions or interpretations',
		'Maximum 3 sentences',
		'Write in present tense',
	],
	edit: [
		'Return a JSON array of edit suggestion objects — no prose before or after',
		'Each object: { "spanStart": <number>, "spanEnd": <number>, "original": "<exact text>", "suggestion": "<replacement text>", "reason": "<brief explanation>" }',
		'spanStart and spanEnd are character offsets (0-indexed) within the scene text',
		'Only suggest changes with clear editorial justification',
		'If no improvements needed, return an empty array: []',
	],
	style_check: [
		'Return a JSON array of style deviation objects — no prose before or after',
		'Each object: { "spanStart": <number>, "spanEnd": <number>, "original": "<exact text>", "suggestion": "<replacement>", "reason": "<rule violated>" }',
		'spanStart and spanEnd are 0-indexed character offsets within the scene text',
		'Only flag deviations that meaningfully conflict with the style guide',
		'If no deviations found, return an empty array: []',
	],
};

function serializeContext(ctx: AiContext): string {
	const lines: string[] = [];

	if (ctx.scene) {
		lines.push(`ACTIVE SCENE: "${ctx.scene.title}"`);
		if (ctx.scene.summary) lines.push(`Summary: ${ctx.scene.summary}`);
		if (ctx.scene.content) lines.push(`Content:\n${ctx.scene.content}`);
	}

	if (ctx.adjacentScenes.length > 0) {
		ctx.adjacentScenes.forEach((s, i) => {
			lines.push(`\nADJACENT SCENE ${i + 1}: "${s.title}"`);
			if (s.content) lines.push(s.content);
		});
	}

	if (ctx.chapter) {
		lines.push(`\nCHAPTER: "${ctx.chapter.title}"`);
		if (ctx.chapter.summary) lines.push(`Summary: ${ctx.chapter.summary}`);
	}

	if (ctx.beats.length > 0) {
		lines.push('\nBEATS:');
		ctx.beats.forEach((b) => lines.push(`- [${b.type}] ${b.title}: ${b.notes}`));
	}

	if (ctx.characters.length > 0) {
		lines.push('\nCHARACTERS:');
		ctx.characters.forEach((c) => lines.push(`- ${c.name} (${c.role}): ${c.traits.join(', ')}`));
	}

	if (ctx.locations.length > 0) {
		lines.push('\nLOCATIONS:');
		ctx.locations.forEach((l) => lines.push(`- ${l.name}: ${l.description}`));
	}

	if (ctx.loreEntries.length > 0) {
		lines.push('\nLORE:');
		ctx.loreEntries.forEach((e) => lines.push(`- [${e.category}] ${e.title}: ${e.content}`));
	}

	if (ctx.plotThreads.length > 0) {
		lines.push('\nPLOT THREADS:');
		ctx.plotThreads.forEach((t) => lines.push(`- [${t.status}] ${t.title}: ${t.description}`));
	}

	return lines.join('\n');
}

export function buildPrompt(task: AiTask, ctx: AiContext): string {
	const taskDescriptions: Record<string, string> = {
		brainstorm: 'Generate creative ideas and possibilities for this scene.',
		outline: 'Create a structured beat-by-beat outline for this chapter.',
		draft: 'Write a complete draft of this scene in prose.',
		continue: 'Continue the narrative from where the scene ends.',
		rewrite: 'Rewrite this scene with improved prose quality.',
		continuity_check: 'Identify all continuity issues across this story.',
		summarize: 'Summarize the provided scene or chapter in 1–3 sentences.',
		edit: 'Identify specific improvements in the provided text and return each as a targeted edit suggestion.',
		style_check:
			'Identify passages that deviate from the provided style guide rules and suggest corrections that bring the prose in line with the target style.',
	};

	const constraints = [
		'Do not invent facts outside the provided context unless explicitly instructed.',
		'Preserve all named entities unless suggesting alternatives.',
		'Stay within the defined task scope.',
		'Do not explain reasoning unless explicitly requested.',
		...(CONSTRAINTS_BY_TYPE[task.taskType] ?? []),
	];

	const outputDescriptions: Record<string, string> = {
		bullet_list: 'Respond with a bulleted list. Each item on its own line starting with "- ".',
		structured_beats: 'Respond with numbered beats: "1. [BEAT TYPE] Description".',
		prose: 'Respond with prose only. No headers, no explanations.',
		structured_issues: 'Respond with a list of issues. Each on its own line.',
		json_issue_list: 'Respond with a JSON array of issue objects only. No prose.',
		plain_text: 'Respond with plain prose only. No headers, no lists.',
		json_edit_suggestions:
			'Return a JSON array of EditSuggestion objects. Each object must have: spanStart (integer), spanEnd (integer), original (string), suggestion (string), reason (string).',
		json_style_deviations:
			'Return a JSON array of StyleDeviation objects with: spanStart, spanEnd, original, suggestion, reason.',
		json_rewrite_options:
			'Return a JSON array of exactly 3 rewrite option objects: [{"index":1,"text":"..."},{"index":2,"text":"..."},{"index":3,"text":"..."}]',
	};

	let contextBody = serializeContext(ctx);

	const headerParts = [
		`## ROLE\n${task.role}`,
		`## TASK\n${taskDescriptions[task.taskType] ?? 'Complete the requested task.'}`
	];

	if (task.instruction) {
		headerParts.push(`## SPECIFIC COMMAND\n${task.instruction}`);
	}

	headerParts.push(
		`## CONTEXT\n${contextBody}`,
		`## CONSTRAINTS\n${constraints.map((c) => `- ${c}`).join('\n')}`,
		`## OUTPUT FORMAT\n${outputDescriptions[task.outputFormat] ?? task.outputFormat}`
	);

	let prompt = headerParts.join('\n\n');

	// Hard truncation if over limit — trim CONTEXT section
	if (prompt.length > MAX_PROMPT_CHARS) {
		const excess = prompt.length - MAX_PROMPT_CHARS;
		contextBody = contextBody.slice(0, contextBody.length - excess - 50); // 50 char buffer
		const contextIndex = headerParts.findIndex(p => p.startsWith('## CONTEXT'));
		if (contextIndex !== -1) {
			headerParts[contextIndex] = `## CONTEXT\n${contextBody}\n[Context truncated due to size limit]`;
		}
		prompt = headerParts.join('\n\n');
	}

	return prompt;
}
