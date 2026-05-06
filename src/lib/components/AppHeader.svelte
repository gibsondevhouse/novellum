<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Chapter, Scene } from '$lib/db/domain-types';
	import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
	import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
	import ModelSelector from './ModelSelector.svelte';
	import PillNav from './ui/PillNav.svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { locale } from '$lib/i18n';
	import {
		buildWorldBuildingTopItems,
		getWorldBuildingTopSection,
	} from '$modules/world-building/worldbuilding-navigation.js';
	import { getReaderMode, setReaderMode, type ReaderMode } from '$lib/stores/reader-mode.svelte.js';
	let isWorldBuildingRoute = $derived(page.url.pathname.includes('/world-building'));

	let worldBuildingActiveId = $derived(getWorldBuildingTopSection(page.url.pathname));
	let worldBuildingTopItems = $derived.by(() => buildWorldBuildingTopItems($locale));

	let isSettingsRoute = $derived(page.url.pathname.startsWith('/settings'));
	let isNovaRoute = $derived(page.url.pathname === '/nova');
	let isProjectRoute = $derived(page.url.pathname.startsWith('/projects/'));
	let isBooksRoute = $derived(page.url.pathname.startsWith('/books'));
	let isReaderRoute = $derived(/^\/books\/[^/]+/.test(page.url.pathname));
	let isImagesRoute = $derived(page.url.pathname.startsWith('/images'));
	let isEditorRoute = $derived(/^\/projects\/[^/]+\/editor$/.test(page.url.pathname));

	let projectTitle = $derived(
		isProjectRoute && page.data?.project ? (page.data.project as { title: string }).title : '',
	);

	let readerBookTitle = $derived(
		isReaderRoute && page.data?.project ? (page.data.project as { title: string }).title : '',
	);

	let displayTitle = $derived.by(() => {
		if (readerBookTitle) return readerBookTitle;
		if (projectTitle) return projectTitle;
		if (isSettingsRoute) return 'Settings';
		if (isNovaRoute) return 'Nova';
		if (isBooksRoute) return 'Books';
		if (isImagesRoute) return 'Images';
		return 'Novellum';
	});

	let editorChapters = $state<Chapter[]>([]);
	let editorScenes = $state<Scene[]>([]);

	$effect(() => {
		if (!isEditorRoute || !page.params?.id) {
			editorChapters = [];
			editorScenes = [];
			return;
		}

		let cancelled = false;

		const fromPageData = (page.data?.chapters as Chapter[] | undefined) ?? [];
		if (fromPageData.length > 0) {
			editorChapters = [...fromPageData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		} else {
			void getChaptersByProjectId(page.params.id).then((chapters) => {
				if (cancelled) return;
				editorChapters = [...chapters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
			});
		}

		const scenesFromPageData = (page.data?.scenes as Scene[] | undefined) ?? [];
		if (scenesFromPageData.length > 0) {
			editorScenes = [...scenesFromPageData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		} else {
			void getScenesByProjectId(page.params.id).then((scenes) => {
				if (cancelled) return;
				editorScenes = [...scenes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
			});
		}

		return () => {
			cancelled = true;
		};
	});

	let editorChapterItems = $derived.by(() => {
		return editorChapters.map((chapter, index) => ({
			id: chapter.id,
			label: `CH ${index + 1}`,
		}));
	});

	let editorActiveChapterId = $derived.by(() => {
		const requested = page.url.searchParams.get('chapterId');
		if (requested) return requested;
		return editorChapters[0]?.id ?? null;
	});

	let editorSceneItems = $derived.by(() => {
		if (!editorActiveChapterId) return [];
		const chapterScenes = editorScenes.filter((scene) => scene.chapterId === editorActiveChapterId);
		return chapterScenes.map((scene, index) => ({
			id: scene.id,
			label: `SC ${index + 1}`,
			title: scene.title || `Scene ${index + 1}`,
		}));
	});

	let editorActiveSceneId = $derived.by(() => {
		const requestedSceneId = page.url.searchParams.get('sceneId');
		if (requestedSceneId) return requestedSceneId;
		return editorSceneItems[0]?.id ?? null;
	});

	function handleNewProject() {
		goto('/books?create=1');
	}

	function handleWorldBuildingSelect(id: string) {
		if (!page.params?.id) return;
		goto(`/projects/${page.params.id}/world-building/${id}`);
	}

	function handleEditorChapterSelect(id: string) {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.set('chapterId', id);
		params.delete('sceneId');
		const query = params.toString();
		void goto(`${page.url.pathname}${query ? `?${query}` : ''}`);
	}

	function handleEditorSceneSelect(id: string) {
		const selectedScene = editorScenes.find((scene) => scene.id === id);
		if (!selectedScene) return;

		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.set('chapterId', selectedScene.chapterId);
		params.set('sceneId', id);
		const query = params.toString();
		void goto(`${page.url.pathname}${query ? `?${query}` : ''}`);
	}
</script>

<header class="app-header">
	<div class="header-left">
		{#if displayTitle}
			<div class="header-context">
				{#if isProjectRoute}
					<span class="header-context__icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
							<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
						</svg>
					</span>
				{/if}
				<span class="header-context__title" title={displayTitle}>{displayTitle}</span>
			</div>
		{/if}
	</div>

	<div class="header-center">
		{#if isWorldBuildingRoute}
			<PillNav
				items={worldBuildingTopItems}
				activeId={worldBuildingActiveId}
				onSelect={handleWorldBuildingSelect}
				ariaLabel="World building sections"
			/>
		{:else if isEditorRoute && editorChapterItems.length > 0}
			<PillNav
				items={editorChapterItems}
				activeId={editorActiveChapterId}
				onSelect={handleEditorChapterSelect}
				ariaLabel="Chapter selection"
			/>
		{:else if isReaderRoute}
			<PillNav
				items={[
					{ id: 'classic', label: 'Classic' },
					{ id: 'book', label: 'Book' },
					{ id: 'fullscreen', label: 'Full Screen' },
				]}
				activeId={getReaderMode()}
				onSelect={(id) => setReaderMode(id as ReaderMode)}
				ariaLabel="Reader mode"
			/>
		{/if}
	</div>

	<div class="header-right">
		{#if isNovaRoute}
			<ModelSelector />
		{/if}
		<button
			class="header-action header-action--new"
			onclick={handleNewProject}
			aria-label="New project"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		</button>

		<button
			class="header-action"
			aria-label="Toggle theme"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5"></circle>
				<line x1="12" y1="1" x2="12" y2="3"></line>
				<line x1="12" y1="21" x2="12" y2="23"></line>
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
				<line x1="1" y1="12" x2="3" y2="12"></line>
				<line x1="21" y1="12" x2="23" y2="12"></line>
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
			</svg>
		</button>

		<a
			href="/nova"
			class="header-action"
			class:header-action--active={isNovaRoute}
			aria-label="Nova AI"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
		</a>

		<a
			href="/settings"
			class="header-action"
			class:header-action--active={isSettingsRoute}
			aria-label="Settings"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
			</svg>
		</a>
	</div>
</header>

{#if isEditorRoute && editorSceneItems.length > 0}
	<nav class="editor-subheader" aria-label="Scene selection">
		<div class="editor-subheader__track">
			{#each editorSceneItems as item (item.id)}
				<button
					type="button"
					class="editor-subheader__pill"
					class:active={item.id === editorActiveSceneId}
					onclick={() => handleEditorSceneSelect(item.id)}
					title={item.title}
				>
					{item.label}
				</button>
			{/each}
		</div>
	</nav>
{/if}

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
		padding: 0 var(--space-4);
		background-color: var(--color-surface-base);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.header-context {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.header-context__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.header-context__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		max-width: clamp(140px, 28vw, 420px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
		justify-content: flex-end;
	}

	.header-action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.header-action:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.header-action:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.header-action--new {
		background-color: var(--color-nova-blue);
		color: white;
	}

	.header-action--new:hover {
		background-color: color-mix(in srgb, var(--color-nova-blue) 85%, white);
		color: white;
	}

	.header-action--active {
		color: var(--color-text-primary);
		background-color: var(--color-surface-glass);
	}

	.header-center {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 0;
	}

	.editor-subheader {
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-base) 88%, var(--color-surface-ground));
	}

	.editor-subheader__track {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		overflow-x: auto;
		max-width: min(980px, 100%);
		padding-bottom: 2px;
		scrollbar-width: thin;
	}

	.editor-subheader__pill {
		border: 1px solid var(--color-border-default);
		background: transparent;
		color: var(--color-text-muted);
		border-radius: var(--radius-full);
		padding: 4px 12px;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		white-space: nowrap;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.editor-subheader__pill:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-strong);
	}

	.editor-subheader__pill.active {
		background: color-mix(in srgb, var(--color-surface-hover) 88%, transparent);
		color: var(--color-text-primary);
		border-color: color-mix(in srgb, var(--color-border-strong) 80%, transparent);
	}

	@media (max-width: 960px) {
		.header-center {
			display: none;
		}

		.app-header {
			gap: var(--space-2);
			padding: 0 var(--space-3);
		}

		.editor-subheader {
			padding: 0 var(--space-3);
		}
	}

	@media (max-width: 640px) {
		.header-context__title {
			max-width: 46vw;
		}

		.header-action {
			width: 30px;
			height: 30px;
		}
	}



</style>
