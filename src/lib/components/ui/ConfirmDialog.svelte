<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
		destructive?: boolean;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onConfirm,
		onCancel,
		destructive = false,
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			dialogEl.showModal?.();
		} else {
			dialogEl.close?.();
		}
	});

	function handleBackdropClick(e: MouseEvent): void {
		if (e.target === dialogEl) onCancel();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="confirm-dialog"
	aria-labelledby="confirm-dialog-title"
	aria-describedby="confirm-dialog-message"
	onclick={handleBackdropClick}
>
	<div class="confirm-dialog__panel" role="document">
		<h2 class="confirm-dialog__title" id="confirm-dialog-title">{title}</h2>
		<p class="confirm-dialog__message" id="confirm-dialog-message">{message}</p>
		<div class="confirm-dialog__actions">
			<button type="button" class="confirm-dialog__cancel" onclick={onCancel}>
				{cancelLabel}
			</button>
			<button
				type="button"
				class="confirm-dialog__confirm"
				class:confirm-dialog__confirm--destructive={destructive}
				onclick={onConfirm}
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</dialog>

<style>
	.confirm-dialog {
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		padding: 0;
		min-width: 320px;
		max-width: 480px;
		box-shadow: var(--shadow-lg);
	}

	.confirm-dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
	}

	.confirm-dialog__panel {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.confirm-dialog__title {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.confirm-dialog__message {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-normal);
	}

	.confirm-dialog__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.confirm-dialog__cancel,
	.confirm-dialog__confirm {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.confirm-dialog__cancel {
		background: transparent;
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.confirm-dialog__cancel:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.confirm-dialog__confirm {
		background: var(--color-nova-blue);
		border: 1px solid transparent;
		color: var(--color-text-on-dark);
	}

	.confirm-dialog__confirm:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 85%, white);
	}

	.confirm-dialog__confirm--destructive {
		background: var(--color-error);
	}

	.confirm-dialog__confirm--destructive:hover {
		background: var(--color-error-dark);
	}

	.confirm-dialog__cancel:focus-visible,
	.confirm-dialog__confirm:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
