import type { AiContext, AiTask } from './types.js';
import {
	MAX_PROMPT_CHARS,
	CONSTRAINTS_BY_TYPE,
	TASK_DESCRIPTIONS,
	OUTPUT_FORMAT_DESCRIPTIONS,
	NOVA_IDENTITY_BLOCK,
} from './constants.js';

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

	if (ctx.writingStyles && ctx.writingStyles.length > 0) {
		lines.push('\nCUSTOM WRITING STYLES:');
		ctx.writingStyles.forEach((ws) => {
			lines.push(`- ${ws.title}: ${ws.description}`);
			if (ws.exampleText) lines.push(`  Example: ${ws.exampleText}`);
		});
	}

	if (ctx.systemPrompts && ctx.systemPrompts.length > 0) {
		const activePrompt = ctx.systemPrompts.find(p => p.isDefault) || ctx.systemPrompts[0];
		if (activePrompt) {
			lines.push(`\nSYSTEM PROMPT:\n${activePrompt.content}`);
		}
	}

	if (ctx.chatInstructions && ctx.chatInstructions.length > 0) {
		const activeInstruction = ctx.chatInstructions.find(i => i.isDefault) || ctx.chatInstructions[0];
		if (activeInstruction) {
			lines.push(`\nCUSTOM INSTRUCTIONS:\n${activeInstruction.content}`);
		}
	}

	return lines.join('\n');
}

export function buildPrompt(task: AiTask, ctx: AiContext): string {
	const constraints = [
		'Do not invent facts outside the provided context unless explicitly instructed.',
		'Preserve all named entities unless suggesting alternatives.',
		'Stay within the defined task scope.',
		'Do not explain reasoning unless explicitly requested.',
		...(CONSTRAINTS_BY_TYPE[task.taskType] ?? []),
	];

	let contextBody = serializeContext(ctx);

	const headerParts = [
		`## ROLE\n${NOVA_IDENTITY_BLOCK}\n\n${task.role}`,
		`## TASK\n${TASK_DESCRIPTIONS[task.taskType] ?? 'Complete the requested task.'}`
	];

	if (task.instruction) {
		headerParts.push(`## SPECIFIC COMMAND\n${task.instruction}`);
	}

	headerParts.push(
		`## CONTEXT\n${contextBody}`,
		`## CONSTRAINTS\n${constraints.map((c) => `- ${c}`).join('\n')}`,
		`## OUTPUT FORMAT\n${OUTPUT_FORMAT_DESCRIPTIONS[task.outputFormat] ?? task.outputFormat}`
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
