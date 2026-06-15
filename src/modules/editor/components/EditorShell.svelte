<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { Chapter, Character, Project, Scene } from '$lib/db/domain-types';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { novaPanel } from '$modules/nova';
	import { sceneIntent } from '$lib/stores/scene-intent.svelte.js';
	import { editorDirty } from '$lib/stores/editor-dirty.svelte.js';
	import {
		SCENE_CONTENT_APPLIED_EVENT,
		type SceneContentAppliedDetail,
	} from '$lib/events/scene-content.js';
	import { editorState } from '../stores/editor.svelte.js';
	import * as autosaveService from '../services/autosave-service.js';
	import type { AutosaveResult } from '../services/autosave-types.js';
	import ManuscriptEditorPane from './ManuscriptEditorPane.svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import SaveStatus from './SaveStatus.svelte';
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
	import SceneSignalNudge from './SceneSignalNudge.svelte';
	import { useSceneSignals } from '../services/scene-signals.svelte.js';
	import { countWords } from '../services/scene-analysis-utils.js';
	import type { OutcomeType, SceneLengthEstimate, SceneDefinition } from '../services/scene-signals.svelte.js';
	import { SHORTCUT_EVENT, type ShortcutEventDetail } from '$lib/keyboard/index.js';

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
	let autosaveResult = $state<AutosaveResult>(autosaveService.getResult());

	function handleSceneContentApplied(detail: SceneContentAppliedDetail): void {
		const scene = data.scenes.find((s: Scene) => s.id === detail.sceneId);
		if (!scene) return;

		scene.content = detail.content;
		scene.wordCount = detail.wordCount;
		scene.updatedAt = detail.updatedAt;

		if (editorState.activeSceneId === detail.sceneId) {
			autosaveService.acknowledgeExternalOverwrite(detail.sceneId, detail.updatedAt);
			activeContent = detail.content;
		}
	}

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

	const _activeChapter = $derived.by((): Chapter | null => {
		if (!activeScene) return null;
		return data.chapters.find((chapter: Chapter) => chapter.id === activeScene.chapterId) ?? null;
	});

	const activeGoal = $derived(quickIntent.goal.trim() || sceneDefinition.sceneGoal.trim());

	const signals = useSceneSignals(
		() => activeContent,
		() => activeGoal,
		() => sceneDefinition,
	);

	const { activeWordCount, sceneTargetWords, sceneProgress, pacingHint, liveSignals, progressFlags, sceneCompassRows } = signals;

	$effect(() => {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) {
			sceneIntent.clear();
			return;
		}
		sceneIntent.set({
			sceneId,
			quickGoal: quickIntent.goal,
			quickObstacle: quickIntent.obstacle,
			quickOutcome: quickIntent.outcome,
			sceneGoal: sceneDefinition.sceneGoal,
			immediateObstacle: sceneDefinition.immediateObstacle,
			tensionSource: sceneDefinition.tensionSource,
			turningPoint: sceneDefinition.turningPoint,
			outcome: sceneDefinition.outcome,
			startState: sceneDefinition.startState,
			endState: sceneDefinition.endState,
			liveSignals: signals.liveSignals,
			progressFlags: signals.progressFlags,
			pacingHint: signals.pacingHint,
			wordCount: signals.activeWordCount,
			targetWords: signals.sceneTargetWords,
		});
	});

	$effect(() => {
		return () => {
			sceneIntent.clear();
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const handler = (event: Event) => {
			const detail = (event as CustomEvent<SceneContentAppliedDetail>).detail;
			if (!detail) return;
			handleSceneContentApplied(detail);
		};
		window.addEventListener(SCENE_CONTENT_APPLIED_EVENT, handler);
		return () => window.removeEventListener(SCENE_CONTENT_APPLIED_EVENT, handler);
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
			autosaveService.mount(scene.id, scene.projectId, (result) => {
				autosaveResult = result;
				editorDirty.setSnapshot({
					sceneId: scene.id,
					status: result.status,
					pendingDraft: result.pendingDraft,
					updatedAt: new Date().toISOString(),
				});
			});
			// Reconcile with SQLite-canonical store (clarity is shared with the outliner).
			const pid = scene.projectId;
			const sid = scene.id;
			void (async () => {
				const clarity = await getProjectMetadata<Partial<SceneDefinition> | null>(
					pid, 'scene', sid, 'clarity', null,
				);
				if (sid !== currentSceneId) return;
				if (clarity) {
					sceneDefinition = {
						sceneGoal: clarity.sceneGoal ?? sceneDefinition.sceneGoal,
						immediateObstacle: clarity.immediateObstacle ?? sceneDefinition.immediateObstacle,
						tensionSource: clarity.tensionSource ?? sceneDefinition.tensionSource,
						turningPoint: clarity.turningPoint ?? sceneDefinition.turningPoint,
						outcome: (clarity.outcome as OutcomeType) ?? sceneDefinition.outcome,
						startState: clarity.startState ?? sceneDefinition.startState,
						endState: clarity.endState ?? sceneDefinition.endState,
						draftStatus: clarity.draftStatus ?? sceneDefinition.draftStatus,
						lengthEstimate: (clarity.lengthEstimate as SceneLengthEstimate) ?? sceneDefinition.lengthEstimate,
					};
				}
				const savedIntent = await getProjectMetadata<Partial<QuickIntent> | null>(
					pid, 'scene', sid, 'quickIntent', null,
				);
				if (sid !== currentSceneId) return;
				if (savedIntent) {
					quickIntent = {
						goal: savedIntent.goal ?? quickIntent.goal,
						obstacle: savedIntent.obstacle ?? quickIntent.obstacle,
						outcome: (savedIntent.outcome as OutcomeType) ?? quickIntent.outcome,
					};
				} else if (sceneDefinition.sceneGoal) {
					// Auto-seed Quick Intent from scene definition when none is saved yet.
					quickIntent = {
						goal: sceneDefinition.sceneGoal,
						obstacle: sceneDefinition.immediateObstacle,
						outcome: sceneDefinition.outcome,
					};
					void setProjectMetadata<QuickIntent>(pid, 'scene', sid, 'quickIntent', quickIntent);
				}
			})();
		}
	});

	$effect(() => {
		return () => {
			autosaveService.flushNow();
			autosaveService.unmount();
			editorDirty.clear();
		};
	});

	$effect(() => {
		const handler = (event: Event) => {
			const detail = (event as CustomEvent<ShortcutEventDetail>).detail;
			if (!detail) return;
			if (detail.actionId === 'save-scene') {
				if (currentSceneId) void autosaveService.flushNow();
				return;
			}
			if (detail.actionId === 'view-in-reader') {
				handleViewInReader();
			}
		};
		window.addEventListener(SHORTCUT_EVENT, handler);
		return () => window.removeEventListener(SHORTCUT_EVENT, handler);
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

	function setActiveScene(sceneId: string, syncUrl = true): void {
		editorState.setActiveSceneId(sceneId);

		if (!syncUrl || page.url.searchParams.get('sceneId') === sceneId) return;

		const search = new SvelteURLSearchParams(page.url.searchParams);
		search.set('sceneId', sceneId);
		const query = search.toString();
		void goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
		});
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
	class:editor-focus-mode={editorPreferences.focusMode}
	class:mode-planning={editorPreferences.mode === 'planning'}
	class:mode-revision={editorPreferences.mode === 'revision'}
>
	{#if editorPreferences.mode === 'planning'}
		<div class="desktop-planning-panel">
			<SceneNavigator
				scenes={data.scenes}
				chapters={data.chapters}
				activeSceneId={editorState.activeSceneId}
				activeContent={activeContent}
				activeSceneDefinition={sceneDefinition}
				onSceneSelect={setActiveScene}
			/>
		</div>
	{/if}

	<main class="editor-area" aria-label="Writing workspace">
		<header class="editor-toolbar" aria-label="Editor toolbar">
			<div class="editor-command-row">
				<div class="editor-command-toolbar">
					<EditorToolbar
						editor={tipTapEditor}
						tick={editorTick}
						spellcheck={spellcheckEnabled}
						onToggleSpellcheck={(next) => (spellcheckEnabled = next)}
						onViewInReader={handleViewInReader}
						novaPanelOpen={novaPanel.isOpen}
						onToggleNova={() => novaPanel.toggle()}
					/>
				</div>
			</div>
			<div class="editor-meta-row">
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
				<SaveStatus result={autosaveResult} />
				<SceneContextPanel
					activeScene={activeScene}
					characters={data.characters}
					activeSceneIndex={activeSceneIndex}
					scenesCount={data.scenes.length}
					onPersistPovCharacter={persistPovCharacter}
					onGoToScene={goToScene}
				/>
			</div>
		</header>

		<div
			class="editor-content-split"
			class:showing-history={editorPreferences.mode === 'revision' && activeScene !== null}
		>
			{#if data.scenes.length === 0}
				<div class="editor-empty-wrap">
					<EmptyStatePanel title="No scenes yet." description="Add one from the Outline." />
				</div>
			{:else}
				<div class="editor-scroll">
					<ManuscriptEditorPane
						content={activeContent}
						onContentChange={handleManuscriptChange}
						oneditorReady={(ed) => (tipTapEditor = ed)}
						ontick={() => (editorTick += 1)}
						spellcheck={spellcheckEnabled}
						onAskNova={(text) =>
							novaPanel.openWithPrompt(
								`About this passage:\n\n"${text.slice(0, 500)}"\n\n`,
							)}
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
		</div>

		<SceneSignalNudge
			signals={liveSignals}
			sceneGoal={quickIntent.goal || sceneDefinition.sceneGoal}
			sceneId={editorState.activeSceneId}
		/>

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
		<div class="desktop-planning-panel">
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
		</div>
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

	.editor-page.mode-revision {
		grid-template-columns: 1fr;
	}

	/* Focus mode collapses navigator and compass even in planning mode */
	.editor-page.editor-focus-mode .desktop-planning-panel {
		display: none;
	}

	.editor-page.editor-focus-mode.mode-planning {
		grid-template-columns: 1fr;
	}

	.desktop-planning-panel {
		display: flex;
		min-width: 0;
		min-height: 0;
	}

	.desktop-planning-panel :global(.doc-list),
	.desktop-planning-panel :global(.story-compass) {
		flex: 1;
	}

	.editor-area {
		position: relative;
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

	.editor-command-row {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	.editor-command-toolbar {
		min-width: 0;
	}

	.editor-meta-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.editor-mode-bar {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		min-width: 0;
	}

	.editor-content-split {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-height: 0;
		overflow: hidden;
	}

	.editor-content-split.showing-history {
		grid-template-columns: minmax(0, 1fr) 320px;
	}

	.editor-content-split :global(.snapshot-history-panel) {
		width: auto;
		min-width: 0;
	}

	.editor-empty-wrap {
		display: grid;
		place-items: center;
		min-height: 0;
		padding: var(--space-6);
	}

	.editor-scroll {
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
		background: color-mix(in srgb, var(--color-candle) 72%, var(--color-brass));
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

		.editor-page.mode-planning {
			grid-template-columns: 1fr;
		}

		.editor-page.mode-planning .desktop-planning-panel {
			display: none;
		}
	}

	@media (max-width: 720px) {
		.editor-page {
			height: calc(100vh - 72px);
		}

		.editor-toolbar {
			gap: var(--space-1);
			padding: var(--space-1) var(--space-2);
		}

		.editor-command-row {
			justify-content: flex-start;
			gap: var(--space-2);
			flex-wrap: wrap;
		}

		.editor-command-toolbar :global(.editor-toolbar-wrap) {
			justify-content: flex-start;
			padding: 0;
		}

		.editor-command-toolbar :global(.pill-toolbar) {
			flex-wrap: nowrap;
			max-width: 100%;
			overflow-x: auto;
			border-radius: var(--radius-md);
		}

		.editor-meta-row {
			justify-content: flex-start;
			gap: var(--space-1);
		}

		.editor-mode-bar {
			max-width: 100%;
			overflow-x: auto;
		}

		.editor-meta-row :global(.editor-context-row) {
			justify-content: flex-start;
			padding-inline: 0;
		}

		.editor-content-split.showing-history {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(0, 1fr) minmax(10rem, 34vh);
		}

		.editor-content-split.showing-history :global(.snapshot-history-panel) {
			height: auto;
			border-left: 0;
			border-top: 1px solid var(--color-border-default);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.editor-page {
			transition: none;
		}
	}
</style>
