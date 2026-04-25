<script lang="ts">
	import { getContext } from 'svelte';
	import type { Project } from '$lib/db/types.js';
	import { GhostButton } from '$lib/components/ui/index.js';
	import ProjectHeroCover from './ProjectHeroCover.svelte';
	import ProjectHeroContent from './ProjectHeroContent.svelte';
	import { submitUpdate } from '../stores/project-hub.svelte.ts';

	let { project } = $props<{ project: Project }>();

	const { openExport, openDelete } = getContext<{
		openExport: () => void;
		openDelete: () => void;
	}>('projectActions');

	function fileToDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
					return;
				}
				reject(new Error('Failed to read selected image.'));
			};
			reader.onerror = () => {
				reject(reader.error ?? new Error('Failed to read selected image.'));
			};
			reader.readAsDataURL(file);
		});
	}

	async function handleCoverUpload(file: File): Promise<void> {
		const coverUrl = await fileToDataUrl(file);
		await submitUpdate(project.id, { coverUrl });
	}

	type HubProjectState = 'planning' | 'drafting' | 'published';

	const selectedState = $derived.by<HubProjectState>(() => {
		const status = (project.status ?? '').toLowerCase();
		if (status === 'planning') return 'planning';
		if (status === 'drafting' || status === 'revising') return 'drafting';
		if (status === 'published' || status === 'completed') return 'published';
		return 'planning';
	});

	async function handleStateChange(event: Event) {
		const next = (event.currentTarget as HTMLSelectElement).value as HubProjectState;
		if (next === selectedState) return;
		await submitUpdate(project.id, { status: next });
	}
</script>

<section class="hub-hero" aria-label="Story identity">
	<div class="hub-hero__glow" aria-hidden="true"></div>
	<div class="hub-hero__controls">
		<div class="hub-hero__state">
			<label class="hub-state-label" for="hub-project-state">State</label>
			<select
				id="hub-project-state"
				class="hub-state-select"
				value={selectedState}
				onchange={handleStateChange}
				aria-label="Project state"
			>
				<option value="planning">Planning</option>
				<option value="drafting">Drafting</option>
				<option value="published">Published</option>
			</select>
		</div>
		<div class="hub-hero__actions" role="group" aria-label="Project actions">
			<GhostButton class="hub-hero-btn" onclick={openExport}>Export</GhostButton>
			<GhostButton class="hub-hero-btn hub-hero-btn--danger" onclick={openDelete}>Delete</GhostButton>
		</div>
	</div>
	<div class="hero-grid">
		<ProjectHeroCover
			coverUrl={project.coverUrl}
			onUpload={handleCoverUpload}
		/>
		<ProjectHeroContent {project} />
	</div>
</section>

<style>
	.hub-hero {
		position: relative;
		overflow: hidden;
		background:
			linear-gradient(150deg, var(--color-surface-raised) 0%, var(--color-surface-overlay) 100%),
			var(--gradient-spotlight);
		padding: var(--space-10);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-default);
		box-shadow: var(--shadow-sm);
	}
	.hub-hero__controls {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-surface-glass) 82%, transparent);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 2;
	}
	.hub-hero__state {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 6px;
	}
	.hub-hero__actions {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-left: 6px;
		border-left: 1px solid var(--color-border-subtle);
	}
	.hub-state-label {
		font-size: 10px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
	.hub-state-select {
		appearance: none;
		padding: 4px 10px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: 10px;
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
	:global(.hub-hero-btn) {
		min-height: 26px;
		padding: 4px 10px !important;
		border-radius: var(--radius-full) !important;
		font-size: 10px !important;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}
	:global(.hub-hero-btn--danger:hover) {
		color: var(--color-error) !important;
		border-color: var(--color-error) !important;
	}
	.hub-state-select:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.hub-hero__glow {
		position: absolute;
		inset: -32% -20% auto;
		height: 420px;
		background:
			radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-nova-blue) 22%, transparent), transparent 44%),
			radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--color-teal) 12%, transparent), transparent 36%);
		pointer-events: none;
	}
	.hero-grid {
		position: relative;
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: var(--space-10);
		align-items: start;
	}
	@media (max-width: 1023px) {
		.hero-grid {
			grid-template-columns: 180px 1fr;
			gap: var(--space-6);
		}
		.hub-hero {
			padding: var(--space-6);
		}
		.hub-hero__controls {
			top: var(--space-3);
			right: var(--space-3);
		}
	}
	@media (max-width: 640px) {
		.hub-hero__controls {
			position: static;
			margin-bottom: var(--space-4);
			width: 100%;
			justify-content: space-between;
			border-radius: var(--radius-lg);
		}
		.hub-hero__actions {
			padding-left: 0;
			border-left: none;
		}
		:global(.hub-hero-btn) {
			padding: 4px 8px !important;
		}
		.hero-grid {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}
		.hub-hero {
			padding: var(--space-4);
		}
	}
</style>
