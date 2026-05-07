<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, setContext } from 'svelte';
	import type { Project } from '$lib/db/domain-types';
	import EditProjectForm from '$modules/project/components/EditProjectForm.svelte';
	import DeleteProjectDialog from '$modules/project/components/DeleteProjectDialog.svelte';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

	let { data, children } = $props<{ data: { project: Project }; children: () => void }>();

	let showEditForm = $state(false);
	let showDeleteDialog = $state(false);
	let showExportModal = $state(false);
	let lastExportFlag = $state<string | null>(null);

	let ExportModal = $state<
		typeof import('$modules/export/components/ExportModal.svelte')['default'] | undefined
	>(undefined);
	onMount(async () => {
		const mod = await import('$modules/export/components/ExportModal.svelte');
		ExportModal = mod.default;
	});

	const project = $derived(data.project);

	$effect(() => {
		const exportFlag = page.url.searchParams.get('export');
		if (exportFlag === '1' && lastExportFlag !== '1') {
			showExportModal = true;
		}
		lastExportFlag = exportFlag;
	});

	function removeExportFlag(search: string): string {
		const raw = search.startsWith('?') ? search.slice(1) : search;
		const filtered = raw
			.split('&')
			.filter(Boolean)
			.filter((entry) => !entry.startsWith('export='));
		return filtered.length > 0 ? `?${filtered.join('&')}` : '';
	}

	function closeExportModal(): void {
		showExportModal = false;
		if (!page.url.searchParams.has('export')) return;

		void goto(`${page.url.pathname}${removeExportFlag(page.url.search)}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
		});
	}

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
		openImport: () => {
			goto('/settings/data');
		}
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

{#if showExportModal && ExportModal}
	<ExportModal
		projectId={project.id}
		open={showExportModal}
		onClose={closeExportModal}
	/>
{/if}

<style>
	.project-shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
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
		min-height: 0;
		view-transition-name: project-mode-content;
	}

	/* ── Content fade transition ── */
	:global(::view-transition-old(project-mode-content)) {
		animation: mode-fade-out var(--duration-fast) var(--ease-standard) forwards;
	}

	:global(::view-transition-new(project-mode-content)) {
		animation: mode-fade-in var(--duration-enter) var(--ease-standard) forwards;
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
