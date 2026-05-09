// Reactive signal computation for the scene compass and live-hint system.
// Returns Svelte 5 $derived values; call inside a component or another composable.

import {
	countWords,
	extractSignalTerms,
	findFirstKeywordIndex,
	keywordHits,
	normalizeText,
} from './scene-analysis-utils.js';

export type OutcomeType = 'win' | 'loss' | 'partial' | 'reversal' | '';
export type SceneLengthEstimate = 'short' | 'medium' | 'long' | '';

export type SceneDefinition = {
	sceneGoal: string;
	immediateObstacle: string;
	tensionSource: string;
	turningPoint: string;
	outcome: OutcomeType;
	startState: string;
	endState: string;
	draftStatus: string;
	lengthEstimate: SceneLengthEstimate;
};

const TENSION_KEYWORDS = ['danger', 'risk', 'threat', 'fear', 'urgent', 'panic', 'pressure', 'doubt'];
const CONFLICT_KEYWORDS = ['but', 'however', 'refused', 'blocked', 'argued', 'fight', 'clash', 'resist'];
const TURN_KEYWORDS = ['suddenly', 'instead', 'then', 'until', 'revealed', 'realized', 'finally', 'pivot'];
const ACTION_KEYWORDS = ['ran', 'grabbed', 'pushed', 'hit', 'moved', 'dashed', 'chased', 'slammed'];

export function useSceneSignals(
	getContent: () => string,
	getActiveGoal: () => string,
	getSceneDefinition: () => SceneDefinition,
) {
	const activeWordCount = $derived(countWords(getContent()));
	const normalizedContent = $derived(normalizeText(getContent()));

	const paragraphs = $derived(
		normalizeText(getContent())
			.split(/\n\s*\n/)
			.map((part) => part.trim())
			.filter(Boolean),
	);

	const recentText = $derived(paragraphs.slice(-2).join(' '));

	const dialogueDensity = $derived.by(() => {
		const content = getContent();
		const quotes = (content.match(/["""]/g) ?? []).length;
		return content.length > 0 ? quotes / content.length : 0;
	});

	const tensionHits = $derived(keywordHits(normalizedContent, TENSION_KEYWORDS));
	const recentTensionHits = $derived(keywordHits(recentText, TENSION_KEYWORDS));
	const conflictHits = $derived(keywordHits(normalizedContent, CONFLICT_KEYWORDS));
	const turnHits = $derived(keywordHits(normalizedContent, TURN_KEYWORDS));
	const actionHits = $derived(keywordHits(normalizedContent, ACTION_KEYWORDS));

	const pacingHint = $derived.by(() => {
		if (dialogueDensity > 0.018) return 'Dialogue-heavy';
		if (actionHits >= 3 && actionHits > tensionHits) return 'Action-heavy';
		if (tensionHits > 0) return 'Slow build with tension';
		return 'Slow build';
	});

	const liveSignals = $derived.by(() => {
		const signals: string[] = [];
		if (dialogueDensity > 0.018) signals.push('Dialogue-heavy scene.');
		if (activeWordCount > 140 && recentTensionHits === 0) {
			signals.push('Low tension detected in recent paragraphs.');
		}
		if (activeWordCount > 180 && conflictHits === 0) {
			signals.push('No clear conflict present yet.');
		}
		if (activeWordCount > 260 && turnHits === 0) {
			signals.push('No turning point detected yet.');
		}

		const goalTokens = extractSignalTerms(getActiveGoal());
		if (goalTokens.length > 0 && activeWordCount > 160) {
			const mentions = goalTokens.some((token) => recentText.includes(token));
			if (!mentions) signals.push('Scene may be drifting from its goal.');
		}

		return signals.length === 0 ? ['Scene momentum looks steady.'] : signals;
	});

	const progressFlags = $derived.by(() => {
		const flags: string[] = [];
		if (activeWordCount > 260 && turnHits === 0) flags.push('No turning point yet');

		const firstConflictIndex = findFirstKeywordIndex(normalizedContent, CONFLICT_KEYWORDS);
		const driftThreshold = Math.floor(normalizedContent.length * 0.6);
		if (firstConflictIndex > driftThreshold && conflictHits > 0) {
			flags.push('Conflict introduced late');
		}
		return flags;
	});

	const sceneTargetWords = $derived.by(() => {
		switch (getSceneDefinition().lengthEstimate) {
			case 'short':
				return 900;
			case 'long':
				return 2000;
			default:
				return 1400;
		}
	});

	const sceneProgress = $derived(
		Math.min(100, Math.round((activeWordCount / Math.max(1, sceneTargetWords)) * 100)),
	);

	const sceneCompassRows = $derived.by(() => {
		const def = getSceneDefinition();
		const changeValue =
			def.startState.trim() && def.endState.trim()
				? `${def.startState.trim()} -> ${def.endState.trim()}`
				: '';
		return [
			{
				label: 'Goal',
				value: def.sceneGoal.trim() || 'No clear goal defined',
				missing: def.sceneGoal.trim().length === 0,
			},
			{
				label: 'Obstacle',
				value: def.immediateObstacle.trim() || 'No clear obstacle defined',
				missing: def.immediateObstacle.trim().length === 0,
			},
			{
				label: 'Tension',
				value: def.tensionSource.trim() || 'Tension not yet established',
				missing: def.tensionSource.trim().length === 0,
			},
			{
				label: 'Turn',
				value: def.turningPoint.trim() || 'No turning point defined yet',
				missing: def.turningPoint.trim().length === 0,
			},
			{
				label: 'Change',
				value: changeValue || 'No meaningful change defined',
				missing: changeValue.length === 0,
			},
		];
	});

	return {
		get activeWordCount() { return activeWordCount; },
		get sceneTargetWords() { return sceneTargetWords; },
		get sceneProgress() { return sceneProgress; },
		get pacingHint() { return pacingHint; },
		get liveSignals() { return liveSignals; },
		get progressFlags() { return progressFlags; },
		get sceneCompassRows() { return sceneCompassRows; },
	};
}
