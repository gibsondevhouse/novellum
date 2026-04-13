<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import type { Project } from '$lib/db';
	import ProjectModeSwitcher from '$lib/components/ProjectModeSwitcher.svelte';
	import EditProjectForm from '$modules/project/components/EditProjectForm.svelte';
	import DeleteProjectDialog from '$modules/project/components/DeleteProjectDialog.svelte';
	import ExportModal from '$modules/export/components/ExportModal.svelte';
	import { initCurrentProject } from '$modules/project/stores/project-hub.svelte.js';

	let { data, children } = $props<{ data: { project: Project }; children: () => void }>();

	let showEditForm = $state(false);
	let showDeleteDialog = $state(false);
	let showExportModal = $state(false);

	const project = $derived(data.project);

	const genreTags = $derived(
		project.genre ? project.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
	);

	// Expose edit trigger to child routes via context
	setContext('projectActions', {
		openEdit: () => {
			showEditForm = true;
		},
	});

	onMount(() => {
		initCurrentProject(data.project);
	});
</script>

<svelte:head>
	<title>{project.title} — Novellum</title>
</svelte:head>

<div class="project-shell">
	<!-- Persistent project frame: never re-renders on mode switch -->
	<header class="project-header">
		<div class="project-frame">
			<div class="project-identity">
				<h1 class="project-title">{project.title}</h1>
				{#if genreTags.length > 0}
					<div class="genre-tags" aria-label="Genre">
						{#each genreTags as tag (tag)}
							<span class="genre-tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="project-utils" role="toolbar" aria-label="Project utilities">
				<button class="util-btn" onclick={() => (showExportModal = true)}>Export</button>
				<button class="util-btn" onclick={() => (showEditForm = !showEditForm)}>
					{showEditForm ? 'Close' : 'Edit'}
				</button>
				<span class="util-divider" aria-hidden="true"></span>
				<button class="util-btn util-btn--danger" onclick={() => (showDeleteDialog = true)}>
					Delete
				</button>
			</div>
		</div>
	</header>

	{#if showEditForm}
		<div class="edit-panel">
			<div class="project-frame">
				<EditProjectForm project={data.project} oncancel={() => (showEditForm = false)} />
			</div>
		</div>
	{/if}

	<ProjectModeSwitcher projectId={project.id} />

	<!-- Dynamic content: only this area changes on mode switch -->
	<div class="mode-content">
		{@render children()}
	</div>
</div>

<!-- Modals are layout-level: persist regardless of active mode -->
{#if showDeleteDialog}
	<DeleteProjectDialog projectId={project.id} oncancel={() => (showDeleteDialog = false)} />
{/if}

{#if showExportModal}
	<ExportModal
		projectId={project.id}
		open={showExportModal}
		onClose={() => (showExportModal = false)}
	/>
{/if}

<style>
	.project-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* ── Project header ── */
	.project-header {
		flex-shrink: 0;
		background-color: var(--color-surface-ground);
		padding: var(--space-4) 0 var(--space-2);
	}

	/* Shared centered frame — aligns header, switcher, and content */
	.project-frame {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 var(--space-6);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-6);
	}

	.project-identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.project-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-normal);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		margin: 0;
	}

	.genre-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.genre-tag {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-teal);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-teal) 25%, transparent);
		border-radius: var(--radius-full);
		padding: 2px var(--space-3);
	}

	.project-utils {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
		padding-top: 4px;
	}

	.util-divider {
		width: 1px;
		height: 14px;
		background: var(--color-border-default);
		margin: 0 var(--space-1);
	}

	.util-btn {
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: var(--transition-border), var(--transition-color);
		white-space: nowrap;
	}

	.util-btn:hover {
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.util-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.util-btn--danger:hover {
		border-color: color-mix(in srgb, var(--color-error) 50%, transparent);
		color: var(--color-error);
	}

	/* ── Edit panel ── */
	.edit-panel {
		flex-shrink: 0;
		padding: 0 0 var(--space-4);
		background-color: var(--color-surface-ground);
	}

	/* ── Mode content ── */
	.mode-content {
		flex: 1;
		overflow: auto;
		view-transition-name: project-mode-content;
	}

	/* ── Content fade transition ── */
	:global(::view-transition-old(project-mode-content)) {
		animation: mode-fade-out 100ms ease forwards;
	}

	:global(::view-transition-new(project-mode-content)) {
		animation: mode-fade-in 180ms ease forwards;
	}

	@keyframes mode-fade-out {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@keyframes mode-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(project-mode-content)),
		:global(::view-transition-new(project-mode-content)) {
			animation: none;
		}
	}
</style>
