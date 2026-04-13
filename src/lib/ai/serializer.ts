// Legacy shape — superseded by AiContext in context-engine.ts
interface LegacyAiContext {
	sceneText: string;
	precedingBeat?: string;
	followingBeat?: string;
	characters: string[];
	projectTitle: string;
}

export function serializeContext(ctx: LegacyAiContext, userPrompt: string) {
	const systemParts = [`You are a writing assistant for the novel "${ctx.projectTitle}".`];
	if (ctx.characters.length > 0) {
		systemParts.push(`Characters in this scene: ${ctx.characters.join(', ')}.`);
	}
	if (ctx.precedingBeat) systemParts.push(`Previous beat: ${ctx.precedingBeat}.`);
	if (ctx.followingBeat) systemParts.push(`Next beat: ${ctx.followingBeat}.`);

	return [
		{ role: 'system' as const, content: systemParts.join(' ') },
		{ role: 'user' as const, content: `Scene text:\n${ctx.sceneText}\n\n${userPrompt}` },
	];
}
