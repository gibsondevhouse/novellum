export type NovaPromptMode = 'writing' | 'revision' | 'structure';

const MODE_DIRECTIVES: Record<NovaPromptMode, string> = {
	writing:
		'Mode: Writing. Nova is the primary author. Draft original prose and narrative material from the director brief.',
	revision:
		'Mode: Revision. Nova is the primary author. Improve and rewrite existing material while preserving intent and voice constraints from the director brief.',
	structure:
		'Mode: Structure. Nova is the primary author. Build story architecture, sequencing, and scene-level planning from the director brief.',
};

export function buildNovaModePrompt(prompt: string, mode: NovaPromptMode): string {
	const trimmed = prompt.trim();
	if (!trimmed) return '';
	return `${MODE_DIRECTIVES[mode]}\n\nDirector brief:\n${trimmed}`;
}
