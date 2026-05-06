import type { TaskType, RetryConfig } from './types.js';

// ── OpenRouter API ──────────────────────────────────────────────────────────
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const FALLBACK_MODELS: Record<string, string[]> = {
	// No fallbacks for now - we're testing with a single model
};

// ── Retry Configuration ─────────────────────────────────────────────────────
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_BASE_DELAY_MS = 1000;

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: DEFAULT_MAX_RETRIES,
	baseDelayMs: DEFAULT_BASE_DELAY_MS,
};

// ── Nova Identity ───────────────────────────────────────────────────────────
export const NOVA_IDENTITY_BLOCK =
	'You are Nova, the AI co-author inside Novellum — a creative writing application. ' +
	'Your role is to assist authors with drafting, editing, brainstorming, and narrative development. ' +
	'You operate as a context-aware writing partner with access to the author\'s current scene, ' +
	'characters, and world-building material.';

// ── Model Configuration ─────────────────────────────────────────────────────
export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export const MODEL_MAP: Record<TaskType, string> = {
	brainstorm: 'openai/gpt-4o-mini',
	outline: 'openai/gpt-4o-mini',
	draft: 'openai/gpt-4o-mini',
	continue: 'openai/gpt-4o-mini',
	rewrite: 'openai/gpt-4o',
	continuity_check: 'openai/gpt-4o',
	summarize: 'openai/gpt-4o-mini',
	edit: 'openai/gpt-4o',
	style_check: 'openai/gpt-4o',
};

// ── Context Engine Limits ───────────────────────────────────────────────────
export const MAX_CHARACTERS = 5;
export const MAX_LOCATIONS = 3;
export const MAX_ADJACENT_SCENE_CHARS = 500;
export const MAX_CHAPTER_SCENE_CHARS = 300;
export const MAX_CONTINUITY_SCENE_CHARS = 200;
export const MAX_CONTINUITY_TOTAL_CHARS = 24000;
export const MAX_CHAPTER_CHARACTERS = 10;
export const MAX_CHAPTER_LOCATIONS = 5;

// ── Prompt Builder ──────────────────────────────────────────────────────────
export const MAX_PROMPT_CHARS = 8000;

export const CONSTRAINTS_BY_TYPE: Record<string, string[]> = {
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

export const TASK_DESCRIPTIONS: Record<string, string> = {
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

export const OUTPUT_FORMAT_DESCRIPTIONS: Record<string, string> = {
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
