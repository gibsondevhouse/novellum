<script lang="ts">
	import type { Project } from '$lib/db/types.js';
	import ProjectHeroCover from './ProjectHeroCover.svelte';
	import ProjectHeroContent from './ProjectHeroContent.svelte';
	import { submitUpdate } from '../stores/project-hub.svelte.ts';

	let { project }: { project: Project } = $props();

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
</script>

<section class="hub-hero" aria-label="Story identity">
	<div class="hub-hero__glow" aria-hidden="true"></div>
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
	}
	@media (max-width: 640px) {
		.hero-grid {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}
		.hub-hero {
			padding: var(--space-4);
		}
	}
</style>
