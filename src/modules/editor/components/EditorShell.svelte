<script lang="ts">
	import type { Chapter, Character, Project, Scene } from '$lib/db/domain-types';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { novaPanel } from '$modules/nova';
	import { editorState } from '../stores/editor.svelte.js';
	import * as autosaveService from '../services/autosave-service.js';
	import ManuscriptEditorPane from './ManuscriptEditorPane.svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import SnapshotHistoryPanel from './SnapshotHistoryPanel.svelte';
	import { updateScene } from '../services/scene-repository.js';
	import {
		getProjectMetadata,
		setProjectMetadata,
	} from '$lib/project-metadata.js';
	import { editorPreferences } from '../stores/editor-preferences.svelte.js';
	import EditorModeToggle from './EditorModeToggle.svelte';
	import FocusModeToggle from './FocusModeToggle.svelte';
	import SceneNavigator from './SceneNavigator.svelte';
	import SceneContextPanel from './SceneContextPanel.svelte';
	import SceneCompassPanel from './SceneCompassPanel.svelte';

	type OutcomeType = 'win' | 'loss' | 'partial' | 'reversal' | '';
	type SceneLengthEstimate = 'short' | 'medium' | 'long' | '';

	type SceneDefinition = {
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

	type QuickIntent = {
		goal: string;
		obstacle: string;
		outcome: OutcomeType;
	};

	const EMPTY_DEFINITION: SceneDefinition = {
		sceneGoal: '',
		immediateObstacle: '',
		tensionSource: '',
		turningPoint: '',
		outcome: '',
		startState: '',
		endState: '',
		draftStatus: '',
		lengthEstimate: '',
	};

	const EMPTY_QUICK_INTENT: QuickIntent = {
		goal: '',
		obstacle: '',
		outcome: '',
	};

	const DAILY_WORD_GOAL = 1200;

	let { data } = $props<{
		data: {
			scenes: Scene[];
			project: Project | undefined;
			chapters: Chapter[];
			characters: Character[];
		};
	}>();

	let activeContent = $state('');
	let currentSceneId = $state<string | null>(null);
	let sceneDefinition = $state<SceneDefinition>({ ...EMPTY_DEFINITION });
	let quickIntent = $state<QuickIntent>({ ...EMPTY_QUICK_INTENT });
	let locationTag = $state('');
	let storyCompassCollapsed = $state(false);
	let initialTotalWords = $state(0);
	let initializedBaseline = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let tipTapEditor = $state<any | null>(null);
	let editorTick = $state(0);
	let spellcheckEnabled = $state(true);

	// Phase 2: hydrate editor preferences when project is available
	$effect(() => {
		if (data.project?.id) {
			void editorPreferences.hydrate(data.project.id);
		}
	});

	const activeScene = $derived.by((): Scene | null => {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return null;
		return data.scenes.find((scene: Scene) => scene.id === sceneId) ?? null;
	});

	const requestedPanel = $derived(page.url.searchParams.get('panel'));
	const selectedChapterId = $derived(page.url.searchParams.get('chapterId'));
	const selectedSceneId = $derived(page.url.searchParams.get('sceneId'));

	$effect(() => {
		if (requestedPanel === 'ai' && !novaPanel.isOpen) {
			novaPanel.open();
		}
	});

	const activeSceneIndex = $derived.by((): number => {
		if (!activeScene) return -1;
		return data.scenes.findIndex((scene: Scene) => scene.id === activeScene.id);
	});

	const activeChapter = $derived.by((): Chapter | null => {
		if (!activeScene) return null;
		return data.chapters.find((chapter: Chapter) => chapter.id === activeScene.chapterId) ?? null;
	});

	const activeWordCount = $derived.by(() => countWords(activeContent));
	const normalizedContent = $derived.by(() => normalizeText(activeContent));

	const activeGoal = $derived.by(() => {
		return quickIntent.goal.trim() || sceneDefinition.sceneGoal.trim();
	});

	const sceneCompassRows = $derived.by(() => {
		const changeValue =
			sceneDefinition.startState.trim() && sceneDefinition.endState.trim()
				? `${sceneDefinition.startState.trim()} -> ${sceneDefinition.endState.trim()}`
				: '';
		return [
			{
				label: 'Goal',
				value: sceneDefinition.sceneGoal.trim() || 'No clear goal defined',
				missing: sceneDefinition.sceneGoal.trim().length === 0,
			},
			{
				label: 'Obstacle',
				value: sceneDefinition.immediateObstacle.trim() || 'No clear obstacle defined',
				missing: sceneDefinition.immediateObstacle.trim().length === 0,
			},
			{
				label: 'Tension',
				value: sceneDefinition.tensionSource.trim() || 'Tension not yet established',
				missing: sceneDefinition.tensionSource.trim().length === 0,
			},
			{
				label: 'Turn',
				value: sceneDefinition.turningPoint.trim() || 'No turning point defined yet',
				missing: sceneDefinition.turningPoint.trim().length === 0,
			},
			{
				label: 'Change',
				value: changeValue || 'No meaningful change defined',
				missing: changeValue.length === 0,
			},
		];
	});

	const paragraphs = $derived.by(() => {
		return normalizeText(activeContent)
			.split(/\n\s*\n/)
			.map((part) => part.trim())
			.filter(Boolean);
	});

	const recentText = $derived.by(() => {
		return paragraphs.slice(-2).join(' ');
	});

	const dialogueDensity = $derived.by(() => {
		const quotes = (activeContent.match(/["""]/g) ?? []).length;
		return activeContent.length > 0 ? quotes / activeContent.length : 0;
	});

	const tensionKeywords = ['danger', 'risk', 'threat', 'fear', 'urgent', 'panic', 'pressure', 'doubt'];
	const conflictKeywords = ['but', 'however', 'refused', 'blocked', 'argued', 'fight', 'clash', 'resist'];
	const turnKeywords = ['suddenly', 'instead', 'then', 'until', 'revealed', 'realized', 'finally', 'pivot'];
	const actionKeywords = ['ran', 'grabbed', 'pushed', 'hit', 'moved', 'dashed', 'chased', 'slammed'];

	const tensionHits = $derived.by(() => keywordHits(normalizedContent, tensionKeywords));
	const recentTensionHits = $derived.by(() => keywordHits(recentText, tensionKeywords));
	const conflictHits = $derived.by(() => keywordHits(normalizedContent, conflictKeywords));
	const turnHits = $derived.by(() => keywordHits(normalizedContent, turnKeywords));
	const actionHits = $derived.by(() => keywordHits(normalizedContent, actionKeywords));

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

		const goalTokens = extractSignalTerms(activeGoal);
		if (goalTokens.length > 0 && activeWordCount > 160) {
			const mentions = goalTokens.some((token) => recentText.includes(token));
			if (!mentions) {
				signals.push('Scene may be drifting from its goal.');
			}
		}

		if (signals.length === 0) {
			signals.push('Scene momentum looks steady.');
		}

		return signals;
	});

	const progressFlags = $derived.by(() => {
		const flags: string[] = [];
		if (activeWordCount > 260 && turnHits === 0) flags.push('No turning point yet');

		const firstConflictIndex = findFirstKeywordIndex(normalizedContent, conflictKeywords);
		const driftThreshold = Math.floor(normalizedContent.length * 0.6);
		if (firstConflictIndex > driftThreshold && conflictHits > 0) {
			flags.push('Conflict introduced late');
		}
		return flags;
	});

	const sceneTargetWords = $derived.by(() => {
		switch (sceneDefinition.lengthEstimate) {
			case 'short':
				return 900;
			case 'long':
				return 2000;
			case 'medium':
			default:
				return 1400;
		}
	});

	const sceneProgress = $derived.by(() => {
		return Math.min(100, Math.round((activeWordCount / Math.max(1, sceneTargetWords)) * 100));
	});

	const totalCurrentWords = $derived.by(() => {
		return data.scenes.reduce(
			(sum: number, scene: Scene) => sum + countWords(scene.content ?? ''),
			0,
		);
	});

	const sessionWords = $derived.by(() => {
		return Math.max(0, totalCurrentWords - initialTotalWords);
	});

	const dailyGoalProgress = $derived.by(() => {
		return Math.min(100, Math.round((sessionWords / DAILY_WORD_GOAL) * 100));
	});

	$effect(() => {
		if (data.scenes.length > 0 && editorState.activeSceneId === null) {
			editorState.setActiveSceneId(data.scenes[0].id);
		}
	});

	$effect(() => {
		if (!selectedSceneId || data.scenes.length === 0) return;

		const requestedScene = data.scenes.find((scene: Scene) => scene.id === selectedSceneId);
		if (!requestedScene) return;

		if (editorState.activeSceneId !== requestedScene.id) {
			editorState.setActiveSceneId(requestedScene.id);
		}
	});

	$effect(() => {
		if (!selectedChapterId || data.scenes.length === 0) return;

		const active = data.scenes.find((scene: Scene) => scene.id === editorState.activeSceneId);
		if (active?.chapterId === selectedChapterId) return;

		const firstSceneInChapter = data.scenes.find(
			(scene: Scene) => scene.chapterId === selectedChapterId,
		);

		if (firstSceneInChapter) {
			editorState.setActiveSceneId(firstSceneInChapter.id);
		}
	});

	$effect(() => {
		if (!initializedBaseline && data.scenes.length > 0) {
			initialTotalWords = data.scenes.reduce(
				(sum: number, scene: Scene) => sum + countWords(scene.content ?? ''),
				0,
			);
			initializedBaseline = true;
		}
	});

	$effect(() => {
		const sceneId = editorState.activeSceneId;
		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene && sceneId !== currentSceneId) {
			if (currentSceneId) autosaveService.flushNow();
			currentSceneId = sceneId;
			activeContent = scene.content ?? '';
			// Phase 4: removed localStorage-based initial load; start with empty and reconcile from SQLite
			sceneDefinition = { ...EMPTY_DEFINITION };
			quickIntent = { ...EMPTY_QUICK_INTENT, goal: scene.summary ?? '' };
			locationTag = scene.locationId ?? '';
			autosaveService.mount(scene.id, scene.projectId);
			// Reconcile with SQLite-canonical store (clarity is shared with the outliner).
			const pid = scene.projectId;
			const sid = scene.id;
			void getProjectMetadata<Partial<SceneDefinition> | null>(
				pid,
				'scene',
				sid,
				'clarity',
				null,
			).then((remote) => {
				if (!remote || sid !== currentSceneId) return;
				sceneDefinition = {
					sceneGoal: remote.sceneGoal ?? sceneDefinition.sceneGoal,
					immediateObstacle: remote.immediateObstacle ?? sceneDefinition.immediateObstacle,
					tensionSource: remote.tensionSource ?? sceneDefinition.tensionSource,
					turningPoint: remote.turningPoint ?? sceneDefinition.turningPoint,
					outcome: (remote.outcome as OutcomeType) ?? sceneDefinition.outcome,
					startState: remote.startState ?? sceneDefinition.startState,
					endState: remote.endState ?? sceneDefinition.endState,
					draftStatus: remote.draftStatus ?? sceneDefinition.draftStatus,
					lengthEstimate:
						(remote.lengthEstimate as SceneLengthEstimate) ?? sceneDefinition.lengthEstimate,
				};
			});
			void getProjectMetadata<Partial<QuickIntent> | null>(
				pid,
				'scene',
				sid,
				'quickIntent',
				null,
			).then((remote) => {
				if (!remote || sid !== currentSceneId) return;
				quickIntent = {
					goal: remote.goal ?? quickIntent.goal,
					obstacle: remote.obstacle ?? quickIntent.obstacle,
					outcome: (remote.outcome as OutcomeType) ?? quickIntent.outcome,
				};
				// Phase 4: removed localStorage.setItem cache write
			});
		}
	});

	$effect(() => {
		return () => {
			autosaveService.flushNow();
			autosaveService.unmount();
		};
	});

	function handleManuscriptChange(html: string): void {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return;
		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene) {
			activeContent = html;
			scene.content = html;
			autosaveService.schedule(html);
		}
	}

	function handleSnapshotRestore(text: string): void {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return;
		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene) {
			activeContent = text;
			scene.content = text;
		}
	}

	function countWords(text: string): number {
		const normalized = text.replace(/<[^>]+>/g, ' ').trim();
		if (!normalized) return 0;
		return normalized.split(/\s+/).length;
	}

	function normalizeText(text: string): string {
		return text
			.replace(/<[^>]+>/g, ' ')
			.toLowerCase()
			.replace(/[^a-z0-9\s\n']/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function keywordHits(text: string, keywords: string[]): number {
		if (!text) return 0;
		return keywords.reduce((total, keyword) => {
			const regex = new RegExp(`\\b${keyword}\\b`, 'g');
			return total + (text.match(regex)?.length ?? 0);
		}, 0);
	}

	function findFirstKeywordIndex(text: string, keywords: string[]): number {
		if (!text) return -1;
		let first = -1;
		for (const keyword of keywords) {
			const index = text.indexOf(keyword);
			if (index >= 0 && (first < 0 || index < first)) first = index;
		}
		return first;
	}

	function extractSignalTerms(text: string): string[] {
		return text
			.toLowerCase()
			.split(/\s+/)
			.map((token) => token.replace(/[^a-z0-9']/g, ''))
			.filter((token) => token.length >= 4)
			.slice(0, 5);
	}

	function persistQuickIntent(): void {
		if (!activeScene) return;
		// Phase 4: removed localStorage.setItem cache; persist to SQLite only
		void setProjectMetadata<QuickIntent>(
			activeScene.projectId,
			'scene',
			activeScene.id,
			'quickIntent',
			quickIntent,
		);
	}

	function setActiveScene(sceneId: string): void {
		editorState.setActiveSceneId(sceneId);
	}

	function goToScene(offset: -1 | 1): void {
		if (activeSceneIndex < 0) return;
		const nextIndex = activeSceneIndex + offset;
		if (nextIndex < 0 || nextIndex >= data.scenes.length) return;
		setActiveScene(data.scenes[nextIndex].id);
	}

	async function persistActiveScenePatch(
		patch: Partial<Omit<Scene, 'id' | 'projectId' | 'createdAt'>>,
	): Promise<void> {
		if (!activeScene) return;
		await updateScene(activeScene.id, patch);
		Object.assign(activeScene, patch, { updatedAt: new Date().toISOString() });
	}

	async function persistPovCharacter(povCharacterId: string): Promise<void> {
		await persistActiveScenePatch({ povCharacterId: povCharacterId || null });
	}

	async function persistLocationTag(): Promise<void> {
		await persistActiveScenePatch({ locationId: locationTag.trim() || null });
	}

	function toggleParticipant(characterId: string): void {
		if (!activeScene) return;
		const current = activeScene.characterIds ?? [];
		const next = current.includes(characterId)
			? current.filter((id) => id !== characterId)
			: [...current, characterId];
		void persistActiveScenePatch({ characterIds: next });
	}

	function handleViewInReader(): void {
		if (!activeScene) {
			void goto(`/books/${data.project?.id}`);
			return;
		}
		const url = `/books/${data.project?.id}?scene=${encodeURIComponent(activeScene.id)}`;
		void goto(url);
	}
</script>

<div
	class="editor-page"
	class:ai-open={novaPanel.isOpen}
	class:editor-focus-mode={editorPreferences.focusMode}
	class:mode-planning={editorPreferences.mode === 'planning'}
	class:mode-revision={editorPreferences.mode === 'revision'}
>
	{#if editorPreferences.mode === 'planning'}
		<SceneNavigator
			scenes={data.scenes}
			chapters={data.chapters}
			activeSceneId={editorState.activeSceneId}
			activeContent={activeContent}
			activeSceneDefinition={sceneDefinition}
			onSceneSelect={setActiveScene}
		/>
	{/if}

	<main class="editor-area" aria-label="Writing workspace">
		<header class="editor-toolbar" aria-label="Editor toolbar">
			<EditorToolbar
				editor={tipTapEditor}
				tick={editorTick}
				spellcheck={spellcheckEnabled}
				onToggleSpellcheck={(next) => (spellcheckEnabled = next)}
				onViewInReader={handleViewInReader}
				novaPanelOpen={novaPanel.isOpen}
				onToggleNova={() => novaPanel.toggle()}
			/>
			<div class="editor-mode-bar">
				<EditorModeToggle
					mode={editorPreferences.mode}
					onModeChange={editorPreferences.setMode}
				/>
				<FocusModeToggle
					focusMode={editorPreferences.focusMode}
					onToggle={editorPreferences.toggleFocus}
				/>
			</div>
			<SceneContextPanel
				activeScene={activeScene}
				characters={data.characters}
				activeSceneIndex={activeSceneIndex}
				scenesCount={data.scenes.length}
				onPersistPovCharacter={persistPovCharacter}
				onGoToScene={goToScene}
			/>
		</header>
		{#if data.scenes.length === 0}
			<EmptyStatePanel title="No scenes yet." description="Add one from the Outline." />
		{:else}
			<div class="editor-scroll">
				<ManuscriptEditorPane
					content={activeContent}
					onContentChange={handleManuscriptChange}
					oneditorReady={(ed) => (tipTapEditor = ed)}
					ontick={() => (editorTick += 1)}
					spellcheck={spellcheckEnabled}
				/>
			</div>
		{/if}
		{#if editorPreferences.mode === 'revision' && activeScene}
			<SnapshotHistoryPanel
				sceneId={activeScene.id}
				currentText={activeContent}
				onRestore={handleSnapshotRestore}
				onClose={() => editorPreferences.setMode('writing')}
			/>
		{/if}
		<footer class="editor-footer" aria-label="Writing progress">
			<div class="progress-block">
				<span>Scene progress</span>
				<div
					class="meter"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={sceneProgress}
				>
					<div class="meter-fill" style={`width: ${sceneProgress}%`}></div>
				</div>
				<strong>{activeWordCount} / {sceneTargetWords}</strong>
			</div>
			<div class="progress-block">
				<span>Session words</span>
				<div
					class="meter"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={dailyGoalProgress}
				>
					<div class="meter-fill session" style={`width: ${dailyGoalProgress}%`}></div>
				</div>
				<strong>{sessionWords} / {DAILY_WORD_GOAL}</strong>
			</div>
		</footer>
	</main>

	{#if editorPreferences.mode === 'planning'}
		<SceneCompassPanel
			sceneCompassRows={sceneCompassRows}
			liveSignals={liveSignals}
			progressFlags={progressFlags}
			quickIntent={quickIntent}
			locationTag={locationTag}
			characters={data.characters}
			activeScene={activeScene}
			activeWordCount={activeWordCount}
			sceneTargetWords={sceneTargetWords}
			pacingHint={pacingHint}
			storyCompassCollapsed={storyCompassCollapsed}
			onCollapsedChange={(val) => (storyCompassCollapsed = val)}
			onQuickIntentChange={(qi) => (quickIntent = qi)}
			onPersistQuickIntent={persistQuickIntent}
			onToggleParticipant={toggleParticipant}
			onPersistLocationTag={persistLocationTag}
			onLocationTagChange={(val) => (locationTag = val)}
		/>
	{/if}

</div>

<style>
	.editor-page {
		display: grid;
		grid-template-columns: 1fr;
		height: calc(100vh - 120px);
		gap: 0;
		overflow: hidden;
		transition: grid-template-columns var(--duration-enter) var(--ease-standard);
		background: var(--color-surface-base);
		border: none;
		border-radius: 0;
	}

	.editor-page.mode-planning {
		grid-template-columns: 250px 1fr 320px;
	}

	.editor-page.mode-planning.ai-open {
		grid-template-columns: 250px 1fr 320px 280px;
	}

	.editor-page.mode-revision {
		grid-template-columns: 1fr;
	}

	/* Focus mode collapses navigator and compass even in planning mode */
	.editor-page.editor-focus-mode :global(.doc-list),
	.editor-page.editor-focus-mode :global(.story-compass) {
		display: none;
	}

	.editor-page.editor-focus-mode.mode-planning {
		grid-template-columns: 1fr;
	}

	.editor-area {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: none;
		border-radius: 0;
		background: var(--color-surface-base);
	}

	.editor-toolbar {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
	}

	.editor-mode-bar {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.editor-scroll {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: var(--color-surface-base);
		overflow: auto;
	}

	.editor-footer {
		display: none;
	}

	.progress-block {
		display: grid;
		grid-template-columns: 110px 1fr auto;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
	}

	.meter {
		height: 8px;
		background: var(--color-surface-overlay);
		border-radius: 999px;
		overflow: hidden;
	}

	.meter-fill {
		height: 100%;
		background: color-mix(in srgb, var(--color-nova-blue) 72%, white);
	}

	.meter-fill.session {
		background: color-mix(in srgb, var(--color-teal) 72%, white);
	}

	@media (max-width: 1520px) {
		.editor-toolbar {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 1360px) {
		.progress-block {
			grid-template-columns: 90px 1fr auto;
		}

		.editor-page.mode-planning {
			grid-template-columns: 230px 1fr 280px;
		}
	}

	@media (max-width: 1260px) {
		.editor-footer {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 1120px) {
		.editor-toolbar :global(.page-header__right) {
			justify-content: flex-start;
			align-items: flex-start;
		}

		.editor-page.mode-planning,
		.editor-page.mode-planning.ai-open {
			grid-template-columns: 1fr;
		}

		.editor-page.mode-planning :global(.story-compass) {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.editor-page {
			transition: none;
		}
	}
</style>
