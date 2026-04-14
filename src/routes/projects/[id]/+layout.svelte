<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import type { Project } from '$lib/db';
	import EditProjectForm from '$modules/project/components/EditProjectForm.svelte';
	import DeleteProjectDialog from '$modules/project/components/DeleteProjectDialog.svelte';
	import ExportModal from '$modules/export/components/ExportModal.svelte';
	import { initCurrentProject } from '$modules/project/stores/project-hub.svelte.js';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

	let { data, children } = $props<{ data: { project: Project }; children: () => void }>();

	let showEditForm = $state(false);
	let showDeleteDialog = $state(false);
	let showExportModal = $state(false);

	const project = $derived(data.project);

	// Expose utility triggers to child routes via context
	setContext('projectActions', {
		openEdit: () => {
			showEditForm = true;
		},
		openDelete: () => {
			showDeleteDialog = true;
		},
		openExport: () => {
			showExportModal = true;
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
	{#if showEditForm}
		<div class="edit-panel">
			<div class="project-frame">
				<EditProjectForm project={data.project} oncancel={() => (showEditForm = false)} />
			</div>
		</div>
	{/if}

	<!-- Dynamic content -->
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

	/* Shared centered frame */
	.project-frame {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 var(--space-6);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-6);
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
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes mode-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(project-mode-content)),
		:global(::view-transition-new(project-mode-content)) {
			animation: none;
		}
	}
</style>
