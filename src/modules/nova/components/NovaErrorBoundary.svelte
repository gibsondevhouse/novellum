<!--
	plan-018 stage-005 phase-005 — Nova error boundary.

	Renders a typed, human-readable error notice when the last Nova
	message failed. Shows a Retry button that calls the provided
	onRetry callback.
-->
<script lang="ts">
	import type { NovaErrorType } from '../types.js';
	import ErrorNotice from '$lib/components/ui/ErrorNotice.svelte';

	interface Props {
		error: string | null;
		errorType: NovaErrorType | null;
		onRetry: () => void;
	}

	let { error, errorType, onRetry }: Props = $props();

	const ERROR_COPY: Record<NovaErrorType, { title: string; message: string }> = {
		rate_limit: {
			title: 'Rate limit reached',
			message: 'Rate limit reached. Please wait a moment and try again.',
		},
		invalid_key: {
			title: 'API key invalid',
			message: 'Your API key is invalid. Please check Settings → AI.',
		},
		context_too_large: {
			title: 'Context too large',
			message:
				'The scene context is too large for this model. Try a shorter scene or different model.',
		},
		network_error: {
			title: 'Network error',
			message: 'Could not reach the AI service. Check your connection.',
		},
		unknown: {
			title: 'Something went wrong',
			message: 'An unexpected error occurred.',
		},
	};

	const copy = $derived(errorType ? ERROR_COPY[errorType] : null);
	// Show the raw provider/transport error for `unknown` so we surface
	// real failure context instead of just "An unexpected error occurred".
	const rawDetail = $derived(errorType === 'unknown' && error ? error : null);
</script>

{#if error && copy}
	<ErrorNotice title={copy.title} message={copy.message} retry={onRetry} />
	{#if rawDetail}
		<details class="nova-error-details">
			<summary>Technical detail</summary>
			<pre>{rawDetail}</pre>
		</details>
	{/if}
{/if}

<style>
	.nova-error-details {
		margin-top: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
	.nova-error-details summary {
		cursor: pointer;
		user-select: none;
	}
	.nova-error-details pre {
		margin: var(--space-1) 0 0;
		padding: var(--space-2);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
