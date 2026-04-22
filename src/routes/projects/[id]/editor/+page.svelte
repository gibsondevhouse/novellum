<script lang="ts">
	import type { Chapter, Character, Project, Scene } from '$lib/db/types.js';
	import AiPanel from '$lib/components/AiPanel.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { aiPanel } from '$lib/stores/ai-panel.svelte';
	import { editorState } from '../../../../modules/editor/stores/editor.svelte.ts';
	import * as autosaveService from '$modules/editor/services/autosave-service.js';
	import ManuscriptSurface from '$modules/editor/components/ManuscriptSurface.svelte';
	import { updateScene } from '$modules/editor/services/scene-repository.js';
	import { GhostButton } from '$lib/components/ui/index.js';

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

	const activeScene = $derived.by((): Scene | null => {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return null;
		return data.scenes.find((scene: Scene) => scene.id === sceneId) ?? null;
	});

	const selectedChapterId = $derived(page.url.searchParams.get('chapterId'));
	const selectedSceneId = $derived(page.url.searchParams.get('sceneId'));

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
		const quotes = (activeContent.match(/["“”]/g) ?? []).length;
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
		return data.scenes.reduce((sum: number, scene: Scene) => sum + countWords(scene.content ?? ''), 0);
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
			initialTotalWords = data.scenes.reduce((sum: number, scene: Scene) => sum + countWords(scene.content ?? ''), 0);
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
			sceneDefinition = loadSceneDefinition(scene);
			quickIntent = loadQuickIntent(scene);
			locationTag = scene.locationId ?? '';
			autosaveService.mount(scene.id, scene.projectId);
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

	function handleTitleChange(newTitle: string): void {
		if (!activeScene) return;
		activeScene.title = newTitle;
		void persistActiveScenePatch({ title: newTitle });
	}

	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function toParagraphHtml(text: string): string {
		const parts = text
			.split(/\n\s*\n/)
			.map((part) => part.trim())
			.filter(Boolean);
		if (parts.length === 0) return '';
		return parts
			.map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
			.join('');
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

	function definitionKey(scene: Scene): string {
		return `novellum.scene-clarity.${scene.projectId}.${scene.id}`;
	}

	function quickIntentKey(scene: Scene): string {
		return `novellum.scene-quick-intent.${scene.projectId}.${scene.id}`;
	}

	function loadSceneDefinition(scene: Scene): SceneDefinition {
		if (typeof localStorage === 'undefined') {
			return { ...EMPTY_DEFINITION };
		}
		const raw = localStorage.getItem(definitionKey(scene));
		if (!raw) {
			return { ...EMPTY_DEFINITION };
		}
		try {
			const parsed = JSON.parse(raw) as Partial<SceneDefinition>;
			return {
				sceneGoal: parsed.sceneGoal ?? '',
				immediateObstacle: parsed.immediateObstacle ?? '',
				tensionSource: parsed.tensionSource ?? '',
				turningPoint: parsed.turningPoint ?? '',
				outcome: (parsed.outcome as OutcomeType) ?? '',
				startState: parsed.startState ?? '',
				endState: parsed.endState ?? '',
				draftStatus: parsed.draftStatus ?? '',
				lengthEstimate: (parsed.lengthEstimate as SceneLengthEstimate) ?? '',
			};
		} catch {
			return { ...EMPTY_DEFINITION };
		}
	}

	function loadQuickIntent(scene: Scene): QuickIntent {
		if (typeof localStorage === 'undefined') {
			return {
				...EMPTY_QUICK_INTENT,
				goal: scene.summary ?? '',
			};
		}
		const raw = localStorage.getItem(quickIntentKey(scene));
		if (!raw) {
			return {
				...EMPTY_QUICK_INTENT,
				goal: scene.summary ?? '',
			};
		}
		try {
			const parsed = JSON.parse(raw) as Partial<QuickIntent>;
			return {
				goal: parsed.goal ?? scene.summary ?? '',
				obstacle: parsed.obstacle ?? '',
				outcome: (parsed.outcome as OutcomeType) ?? '',
			};
		} catch {
			return {
				...EMPTY_QUICK_INTENT,
				goal: scene.summary ?? '',
			};
		}
	}

	function persistQuickIntent(): void {
		if (!activeScene || typeof localStorage === 'undefined') return;
		localStorage.setItem(quickIntentKey(activeScene), JSON.stringify(quickIntent));
	}

	function getScenePreviewMeta(scene: Scene): SceneDefinition {
		if (activeScene?.id === scene.id) return sceneDefinition;
		return loadSceneDefinition(scene);
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

	// Close AI panel when user navigates back via browser history
	$effect(() => {
		if (!page.state?.aiPanelOpen && aiPanel.isOpen) {
			aiPanel.isOpen = false;
		}
	});

	async function handleAccept(text: string) {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return;
		const appendix = toParagraphHtml(text);
		const updated = appendix ? `${activeContent}${appendix}` : activeContent;
		activeContent = updated;

		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene) {
			scene.content = updated;
			autosaveService.schedule(updated);
		}
	}

	function handleAskAi(mode: 'continue' | 'dialogue' | 'tension' | 'summary') {
		if (!aiPanel.isOpen) {
			// Shallow-route: push history entry so browser back closes the panel
			pushState('', { ...page.state, aiPanelOpen: true });
			aiPanel.toggle();
		}
		const context = activeContent.slice(-1200);
		const prompt =
			mode === 'dialogue'
				? `Revise this excerpt to sharpen dialogue while preserving tone and intent:\n\n${context}`
				: mode === 'tension'
					? `Increase immediate tension in this scene excerpt without changing core events:\n\n${context}`
					: mode === 'summary'
						? `Summarize this scene in one vivid sentence and list what changes by the end:\n\n${context}`
						: activeContent
							? `Continue this scene naturally from the current ending:\n\n${context}`
							: 'Help me start a new scene.';
		aiPanel.requestSuggestion(prompt);
	}
</script>

<svelte:head>
	<title>Editor — Novellum</title>
</svelte:head>

<div class="editor-page" class:ai-open={aiPanel.isOpen}>
	<aside class="doc-list" aria-label="Scene navigator">
		<div class="doc-list-header">
			<div class="doc-list-title">Draft Queue</div>
			<div class="doc-list-meta">{data.scenes.length} scenes · {data.chapters.length} chapters</div>
		</div>
		{#if data.scenes.length === 0}
			<EmptyState title="No scenes yet" />
		{:else}
			<ul class="scene-list">
				{#each data.scenes as scene (scene.id)}
					{@const sceneMeta = getScenePreviewMeta(scene)}
					{@const chapter = data.chapters.find((item: Chapter) => item.id === scene.chapterId)}
					{@const words = countWords(scene.id === activeScene?.id ? activeContent : scene.content ?? '')}
					<li>
						<button
							class="scene-item"
							class:active={editorState.activeSceneId === scene.id}
							onclick={() => setActiveScene(scene.id)}
							aria-label={`Open scene ${scene.title}`}
						>
							<span class="scene-item-title">{scene.title}</span>
							<span class="scene-item-meta">{chapter?.title ?? 'Unassigned chapter'} · {words} words</span>
							<span class="scene-item-tags">
								{#if sceneMeta.draftStatus}
									<span class="chip">{sceneMeta.draftStatus}</span>
								{/if}
								{#if sceneMeta.outcome}
									<span class="chip">{sceneMeta.outcome}</span>
								{/if}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>

	<main class="editor-area" aria-label="Writing workspace">
		<header class="editor-toolbar">
			<div class="scene-context">
				<p class="scene-context__eyebrow">Drafting Studio</p>
				<h1>{activeScene?.title ?? 'Scene'}</h1>
				<p>{activeChapter?.title ?? 'Unassigned chapter'}{#if data.project} · {data.project.title}{/if}</p>
			</div>
			<div class="inline-context" aria-label="Writing context controls">
				<label class="inline-field">
					<span>POV</span>
					<select
						value={activeScene?.povCharacterId ?? ''}
						onchange={(event) =>
							void persistPovCharacter((event.target as HTMLSelectElement).value)}
					>
						<option value="">Unassigned</option>
						{#each data.characters as character (character.id)}
							<option value={character.id}>{character.name}</option>
						{/each}
					</select>
				</label>
			</div>
			<div class="nav-actions">
				<button class="nav-btn" onclick={() => goToScene(-1)} disabled={activeSceneIndex <= 0}>Previous</button>
				<button class="nav-btn" onclick={() => goToScene(1)} disabled={activeSceneIndex < 0 || activeSceneIndex >= data.scenes.length - 1}>Next</button>
			</div>
			<div class="ai-actions-wrap">
				<span class="ai-actions-label">AI Commands</span>
				<div class="ai-actions" role="toolbar" aria-label="AI scene tools">
				<GhostButton onclick={() => handleAskAi('continue')} title="Continue scene">Continue</GhostButton>
				<GhostButton onclick={() => handleAskAi('dialogue')} title="Punch up dialogue">Dialogue</GhostButton>
				<GhostButton onclick={() => handleAskAi('tension')} title="Raise tension">Tension</GhostButton>
				<GhostButton onclick={() => handleAskAi('summary')} title="Summarize scene">Summary</GhostButton>
				</div>
			</div>
		</header>
		{#if data.scenes.length === 0}
			<EmptyState title="No scenes yet" description="Add one from the Outline." />
		{:else}
			<div class="editor-scroll">
				<ManuscriptSurface
					content={activeContent}
					title={activeScene?.title ?? ''}
					onContentChange={handleManuscriptChange}
					onTitleChange={handleTitleChange}
				/>
			</div>
		{/if}
		<footer class="editor-footer" aria-label="Writing progress">
			<div class="progress-block">
				<span>Scene progress</span>
				<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={sceneProgress}>
					<div class="meter-fill" style={`width: ${sceneProgress}%`}></div>
				</div>
				<strong>{activeWordCount} / {sceneTargetWords}</strong>
			</div>
			<div class="progress-block">
				<span>Session words</span>
				<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={dailyGoalProgress}>
					<div class="meter-fill session" style={`width: ${dailyGoalProgress}%`}></div>
				</div>
				<strong>{sessionWords} / {DAILY_WORD_GOAL}</strong>
			</div>
		</footer>
	</main>

	<aside class="story-compass" aria-label="Story compass">
		<div class="compass-header">
			<h2>Story Compass</h2>
			<button
				type="button"
				class="collapse-btn"
				onclick={() => (storyCompassCollapsed = !storyCompassCollapsed)}
				aria-expanded={!storyCompassCollapsed}
			>
				{storyCompassCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !storyCompassCollapsed}
			<section class="panel-section" aria-label="Scene compass definition">
				<h3>Scene Compass</h3>
				<ul class="compass-list">
					{#each sceneCompassRows as row (row.label)}
						<li>
							<span>{row.label}</span>
							<strong class:soft={row.missing}>{row.value}</strong>
						</li>
					{/each}
				</ul>
			</section>

			<section class="panel-section" aria-label="Live writing signals">
				<h3>Live Writing Signals</h3>
				<ul class="signal-list">
					{#each liveSignals as signal (signal)}
						<li>{signal}</li>
					{/each}
				</ul>
			</section>

			<details class="quick-intent" aria-label="Quick intent" ontoggle={persistQuickIntent}>
				<summary>Quick Intent</summary>
				<div class="quick-intent-grid">
					<label>
						<span>Goal</span>
						<input bind:value={quickIntent.goal} onblur={persistQuickIntent} />
					</label>
					<label>
						<span>Obstacle</span>
						<input bind:value={quickIntent.obstacle} onblur={persistQuickIntent} />
					</label>
					<label>
						<span>Outcome</span>
						<select bind:value={quickIntent.outcome} onblur={persistQuickIntent}>
							<option value="">Unspecified</option>
							<option value="win">Win</option>
							<option value="loss">Loss</option>
							<option value="partial">Partial</option>
							<option value="reversal">Reversal</option>
						</select>
					</label>
				</div>
			</details>

			<section class="panel-section" aria-label="Participants and context">
				<h3>Participants + Context</h3>
				<div class="participants-line">
					{#each data.characters as character (character.id)}
						<button
							type="button"
							class="participant-chip"
							class:active={activeScene?.characterIds?.includes(character.id)}
							onclick={() => toggleParticipant(character.id)}
						>
							{character.name}
						</button>
					{/each}
				</div>
				<label>
					<span>Location</span>
					<input bind:value={locationTag} onblur={() => void persistLocationTag()} placeholder="Location tag" />
				</label>
			</section>

			<section class="panel-section" aria-label="Progress indicators">
				<h3>Progress</h3>
				<p class="progress-line">{activeWordCount} / {sceneTargetWords} words</p>
				<p class="progress-line">Pacing hint: {pacingHint}</p>
				{#if progressFlags.length > 0}
					<ul class="flag-list">
						{#each progressFlags as flag (flag)}
							<li>{flag}</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}
	</aside>

	<AiPanel onAccept={handleAccept} />
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

	.editor-page.ai-open {
		grid-template-columns: 1fr;
	}

	.doc-list {
		display: none;
	}

	.doc-list-header {
		padding: var(--space-2) 0 var(--space-3);
		margin-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.doc-list-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	.doc-list-title {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.scene-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.scene-item {
		width: 100%;
		text-align: left;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		transition:
			background-color 0.1s ease,
			color 0.1s ease;
	}

	.scene-item-title {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.scene-item-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.scene-item-tags {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.chip {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 999px;
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}

	.scene-item:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.scene-item.active {
		background-color: color-mix(in srgb, var(--color-teal) 10%, transparent);
		color: var(--color-teal);
		border-color: color-mix(in srgb, var(--color-teal) 30%, transparent);
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
		display: none;
	}

	.scene-context h1 {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
	}

	.scene-context__eyebrow {
		margin: 0 0 var(--space-1);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.scene-context p {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.inline-context {
		display: flex;
		align-items: center;
	}

	.inline-field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.inline-field select {
		min-width: 150px;
	}

	.nav-actions,
	.ai-actions {
		display: flex;
		gap: var(--space-2);
	}

	.ai-actions-wrap {
		display: grid;
		gap: var(--space-1);
	}

	.ai-actions-label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.nav-btn {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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

	.story-compass {
		display: none;
	}

	:global(.ai-panel) {
		display: none;
	}

	.compass-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.compass-header h2 {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin: 0;
	}

	.collapse-btn {
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, transparent);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.panel-section {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.panel-section h3 {
		margin: 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.compass-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-1);
	}

	.compass-list li {
		display: grid;
		gap: 2px;
	}

	.compass-list span {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.compass-list strong {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.compass-list strong.soft {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.signal-list,
	.flag-list {
		margin: 0;
		padding-left: var(--space-4);
		display: grid;
		gap: 2px;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.quick-intent {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.quick-intent summary {
		cursor: pointer;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.quick-intent-grid {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	label,
	.participants-line {
		display: grid;
		gap: 4px;
	}

	label span {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	input,
	select {
		width: 100%;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.participants-line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.participant-chip {
		border: 1px solid var(--color-border-default);
		background: transparent;
		color: var(--color-text-secondary);
		border-radius: 999px;
		padding: 3px 8px;
		font-size: 11px;
		cursor: pointer;
	}

	.participant-chip.active {
		background: color-mix(in srgb, var(--color-teal) 12%, transparent);
		color: var(--color-teal);
		border-color: color-mix(in srgb, var(--color-teal) 30%, transparent);
	}

	.progress-line {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.flag-list {
		margin-top: var(--space-1);
	}

	@media (max-width: 1520px) {
		.editor-toolbar {
			flex-wrap: wrap;
		}

		.ai-actions {
			width: 100%;
		}

		.inline-context {
			order: 3;
		}
	}

	@media (max-width: 1360px) {
		.inline-field select {
			min-width: 120px;
		}

		.progress-block {
			grid-template-columns: 90px 1fr auto;
		}
	}

	@media (max-width: 1260px) {
		.editor-footer {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 1120px) {
		.inline-context {
			display: none;
		}
	}

	@media (max-width: 1360px) {
		.editor-page {
			grid-template-columns: 250px 1fr 300px 0;
		}

		.editor-page.ai-open {
			grid-template-columns: 250px 1fr 300px 280px;
		}
	}

	@media (max-width: 1120px) {
		.editor-page,
		.editor-page.ai-open {
			grid-template-columns: 230px 1fr;
		}

		.story-compass {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.editor-page {
			transition: none;
		}
	}
</style>
