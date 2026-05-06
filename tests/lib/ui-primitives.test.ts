import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushSync } from 'svelte';
import ErrorNotice from '$lib/components/ui/ErrorNotice.svelte';
import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
import Stepper from '$lib/components/ui/Stepper.svelte';
import MetadataRow from '$lib/components/ui/MetadataRow.svelte';

// jsdom does not implement showModal/close on HTMLDialogElement.
// Provide minimal stubs so $effect calls don't throw.
if (typeof HTMLDialogElement !== 'undefined') {
	HTMLDialogElement.prototype.showModal = vi.fn();
	HTMLDialogElement.prototype.close = vi.fn();
}

let target: HTMLElement;

beforeEach(() => {
	document.body.innerHTML = '';
	target = document.createElement('div');
	document.body.appendChild(target);
});

// ── ErrorNotice ──────────────────────────────────────────────────────────────

describe('ErrorNotice.svelte', () => {
	it('renders the message', () => {
		mount(ErrorNotice, { target, props: { message: 'Something broke' } });
		flushSync();
		expect(target.textContent).toContain('Something broke');
	});

	it('has role="alert" for accessibility', () => {
		mount(ErrorNotice, { target, props: { message: 'Oops' } });
		flushSync();
		const el = target.querySelector('[role="alert"]');
		expect(el).not.toBeNull();
	});

	it('does not render retry button when retry prop is omitted', () => {
		mount(ErrorNotice, { target, props: { message: 'No retry' } });
		flushSync();
		expect(target.querySelector('button')).toBeNull();
	});

	it('renders retry button when retry prop is provided', () => {
		const retry = vi.fn();
		mount(ErrorNotice, { target, props: { message: 'Fail', retry } });
		flushSync();
		const btn = target.querySelector('button') as HTMLButtonElement;
		expect(btn).not.toBeNull();
		btn.click();
		expect(retry).toHaveBeenCalledOnce();
	});

	it('renders optional title when provided', () => {
		mount(ErrorNotice, { target, props: { message: 'msg', title: 'Error title' } });
		flushSync();
		expect(target.textContent).toContain('Error title');
	});
});

// ── StatusBadge ──────────────────────────────────────────────────────────────

describe('StatusBadge.svelte', () => {
	it('renders the label', () => {
		mount(StatusBadge, { target, props: { status: 'success', label: 'Published' } });
		flushSync();
		expect(target.textContent).toContain('Published');
	});

	it('applies the correct status modifier class', () => {
		mount(StatusBadge, { target, props: { status: 'error', label: 'Failed' } });
		flushSync();
		const badge = target.querySelector('.status-badge--error');
		expect(badge).not.toBeNull();
	});

	it('applies success class for success status', () => {
		mount(StatusBadge, { target, props: { status: 'success', label: 'OK' } });
		flushSync();
		expect(target.querySelector('.status-badge--success')).not.toBeNull();
	});

	it('applies warning class for warning status', () => {
		mount(StatusBadge, { target, props: { status: 'warning', label: 'Warn' } });
		flushSync();
		expect(target.querySelector('.status-badge--warning')).not.toBeNull();
	});

	it('applies info class for info status', () => {
		mount(StatusBadge, { target, props: { status: 'info', label: 'Info' } });
		flushSync();
		expect(target.querySelector('.status-badge--info')).not.toBeNull();
	});

	it('applies neutral class for neutral status', () => {
		mount(StatusBadge, { target, props: { status: 'neutral', label: 'Draft' } });
		flushSync();
		expect(target.querySelector('.status-badge--neutral')).not.toBeNull();
	});
});

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

describe('ConfirmDialog.svelte', () => {
	const baseProps = {
		open: true,
		title: 'Delete chapter?',
		message: 'This action cannot be undone.',
		onConfirm: vi.fn(),
		onCancel: vi.fn(),
	};

	it('renders title and message when open=true', () => {
		mount(ConfirmDialog, { target, props: { ...baseProps } });
		flushSync();
		expect(target.textContent).toContain('Delete chapter?');
		expect(target.textContent).toContain('This action cannot be undone.');
	});

	it('calls onConfirm when confirm button is clicked', () => {
		const onConfirm = vi.fn();
		mount(ConfirmDialog, { target, props: { ...baseProps, onConfirm } });
		flushSync();
		const buttons = target.querySelectorAll('button');
		// Last button is Confirm
		const confirmBtn = buttons[buttons.length - 1] as HTMLButtonElement;
		confirmBtn.click();
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('calls onCancel when cancel button is clicked', () => {
		const onCancel = vi.fn();
		mount(ConfirmDialog, { target, props: { ...baseProps, onCancel } });
		flushSync();
		const buttons = target.querySelectorAll('button');
		// First button is Cancel
		const cancelBtn = buttons[0] as HTMLButtonElement;
		cancelBtn.click();
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('renders custom confirmLabel and cancelLabel', () => {
		mount(ConfirmDialog, {
			target,
			props: { ...baseProps, confirmLabel: 'Yes, delete', cancelLabel: 'No, keep' },
		});
		flushSync();
		expect(target.textContent).toContain('Yes, delete');
		expect(target.textContent).toContain('No, keep');
	});

	it('applies destructive modifier class when destructive=true', () => {
		mount(ConfirmDialog, { target, props: { ...baseProps, destructive: true } });
		flushSync();
		const destructiveBtn = target.querySelector('.confirm-dialog__confirm--destructive');
		expect(destructiveBtn).not.toBeNull();
	});
});

// ── Stepper ──────────────────────────────────────────────────────────────────

describe('Stepper.svelte', () => {
	it('renders the correct number of step dots', () => {
		mount(Stepper, { target, props: { steps: 5, current: 0 } });
		flushSync();
		const dots = target.querySelectorAll('.stepper__dot');
		expect(dots.length).toBe(5);
	});

	it('marks the current step with active class', () => {
		mount(Stepper, { target, props: { steps: 4, current: 2 } });
		flushSync();
		const dots = target.querySelectorAll('.stepper__dot');
		expect(dots[2].classList.contains('stepper__dot--active')).toBe(true);
	});

	it('marks completed steps with done class', () => {
		mount(Stepper, { target, props: { steps: 4, current: 2 } });
		flushSync();
		const dots = target.querySelectorAll('.stepper__dot');
		expect(dots[0].classList.contains('stepper__dot--done')).toBe(true);
		expect(dots[1].classList.contains('stepper__dot--done')).toBe(true);
	});

	it('does not mark future steps as done or active', () => {
		mount(Stepper, { target, props: { steps: 4, current: 1 } });
		flushSync();
		const dots = target.querySelectorAll('.stepper__dot');
		expect(dots[2].classList.contains('stepper__dot--done')).toBe(false);
		expect(dots[2].classList.contains('stepper__dot--active')).toBe(false);
	});

	it('has role="tablist" for accessibility', () => {
		mount(Stepper, { target, props: { steps: 3, current: 0 } });
		flushSync();
		expect(target.querySelector('[role="tablist"]')).not.toBeNull();
	});
});

// ── MetadataRow ───────────────────────────────────────────────────────────────

describe('MetadataRow.svelte', () => {
	it('renders the label', () => {
		mount(MetadataRow, { target, props: { label: 'Genre', value: 'Fantasy' } });
		flushSync();
		expect(target.textContent).toContain('Genre');
	});

	it('renders the value', () => {
		mount(MetadataRow, { target, props: { label: 'Genre', value: 'Fantasy' } });
		flushSync();
		expect(target.textContent).toContain('Fantasy');
	});

	it('applies the label class to the label element', () => {
		mount(MetadataRow, { target, props: { label: 'Status', value: 'Draft' } });
		flushSync();
		const labelEl = target.querySelector('.metadata-row__label');
		expect(labelEl).not.toBeNull();
		expect(labelEl?.textContent).toBe('Status');
	});

	it('applies the value class to the value element', () => {
		mount(MetadataRow, { target, props: { label: 'Status', value: 'Draft' } });
		flushSync();
		const valueEl = target.querySelector('.metadata-row__value');
		expect(valueEl).not.toBeNull();
		expect(valueEl?.textContent).toBe('Draft');
	});
});
