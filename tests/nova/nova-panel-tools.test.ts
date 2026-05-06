/**
 * plan-023 stage-006 phase-004 — NovaPanel tool-call/tool-result rendering.
 *
 * Drives the panel via real DOM mounts; we seed messages directly via
 * `novaSession.append` since there is no UI affordance for initiating
 * a tool call this stage. Tool-result messages encode the tool status
 * inside `toolPayload` (matches the `ToolResult` shape returned by
 * `dispatchTool`).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

vi.mock('$modules/nova/services/chat-service.js', () => ({
	sendNovaChat: vi.fn(),
}));

import { NovaPanel, novaPanel, novaSession } from '$modules/nova';

describe('NovaPanel.svelte — tool-call / tool-result rendering', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		window.sessionStorage.clear();
		novaPanel.close();
		novaSession.clear();
	});

	afterEach(() => {
		novaPanel.close();
		novaSession.clear();
		window.sessionStorage.clear();
	});

	it('renders a tool-call message with label, tool id, and a collapsible Input block', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.append({
			role: 'tool-call',
			content: '',
			toolId: 'worldbuilding.create-character',
			toolPayload: { name: 'Aria', role: 'protagonist' },
		});
		flushSync();

		const chip = target.querySelector('[data-testid="nova-tool-call"]');
		expect(chip).not.toBeNull();
		expect(chip?.textContent).toContain('Calling tool:');
		expect(chip?.textContent).toContain('worldbuilding.create-character');

		const details = chip?.querySelector('details');
		expect(details).not.toBeNull();
		expect(details?.querySelector('summary')?.textContent).toContain('Input');

		const pre = details?.querySelector('pre');
		expect(pre?.textContent).toContain('"name": "Aria"');
		expect(pre?.textContent).toContain('"role": "protagonist"');
		unmount(cmp);
	});

	it('renders a tool-result with not-yet-supported using error styling', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.append({
			role: 'tool-result',
			content: '',
			toolId: 'continuity.scan-scene',
			toolPayload: {
				status: 'not-yet-supported',
				output: null,
				error: 'Tool continuity.scan-scene is registered but not yet wired (planned for plan-XXX).',
			},
		});
		flushSync();

		const chip = target.querySelector('[data-testid="nova-tool-result"]') as HTMLElement;
		expect(chip).not.toBeNull();
		expect(chip.classList.contains('is-error')).toBe(true);
		expect(chip.textContent).toContain('Result:');
		expect(chip.textContent).toContain('continuity.scan-scene');
		expect(chip.textContent).toContain('not-yet-supported');
		expect(chip.querySelector('.nova-tool-error')?.textContent).toContain('plan-XXX');
		unmount(cmp);
	});

	it('renders a successful tool-result without is-error styling', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.append({
			role: 'tool-result',
			content: '',
			toolId: 'outline.suggest-beat',
			toolPayload: {
				status: 'success',
				output: { suggestion: 'A new beat.' },
			},
		});
		flushSync();

		const chip = target.querySelector('[data-testid="nova-tool-result"]') as HTMLElement;
		expect(chip).not.toBeNull();
		expect(chip.classList.contains('is-error')).toBe(false);
		expect(chip.textContent).toContain('outline.suggest-beat');
		expect(chip.textContent).toContain('success');
		unmount(cmp);
	});

	it('renders an error-styled chip for status=error', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.append({
			role: 'tool-result',
			content: '',
			toolId: 'worldbuilding.update-location',
			toolPayload: {
				status: 'error',
				error: 'Boom.',
			},
		});
		flushSync();

		const chip = target.querySelector('[data-testid="nova-tool-result"]') as HTMLElement;
		expect(chip.classList.contains('is-error')).toBe(true);
		expect(chip.textContent).toContain('error');
		expect(chip.querySelector('.nova-tool-error')?.textContent).toContain('Boom.');
		unmount(cmp);
	});
});
