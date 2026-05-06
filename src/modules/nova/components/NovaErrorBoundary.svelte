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
</script>

{#if error && copy}
	<ErrorNotice title={copy.title} message={copy.message} retry={onRetry} />
{/if}
