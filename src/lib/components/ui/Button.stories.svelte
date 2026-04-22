<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Button, DestructiveButton, GhostButton, PrimaryButton } from './index.js';

	const { Story } = defineMeta({
		title: 'UI/Button',
		tags: ['autodocs'],
	});
</script>

<Story name="Variants">
	<div style="display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center;">
		<PrimaryButton>Primary</PrimaryButton>
		<GhostButton>Ghost</GhostButton>
		<DestructiveButton>Destructive</DestructiveButton>
		<Button variant="outline">Outline</Button>
		<Button variant="secondary">Secondary</Button>
	</div>
</Story>

<Story name="Disabled">
	<div style="display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center;">
		<PrimaryButton disabled>Primary</PrimaryButton>
		<GhostButton disabled>Ghost</GhostButton>
		<DestructiveButton disabled>Destructive</DestructiveButton>
	</div>
</Story>
