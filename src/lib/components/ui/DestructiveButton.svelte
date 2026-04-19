<script lang="ts">
	import { Button } from './button/index.js';
	import type { ComponentProps } from 'svelte';

	type Props = Omit<ComponentProps<typeof Button>, 'variant'>;

	let { children, class: className = '', ...rest }: Props = $props();
</script>

	<Button variant="destructive" class={className} {...rest}>
	{@render children?.()}
</Button>
