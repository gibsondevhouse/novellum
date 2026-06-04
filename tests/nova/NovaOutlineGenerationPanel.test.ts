import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { RagContextResult } from '../../src/modules/nova/types.js';
import type { OutlineContextSufficiencyResult } from '../../src/lib/ai/pipeline/outline-context-sufficiency.js';
import NovaOutlineGenerationPanel from '../../src/modules/nova/components/NovaOutlineGenerationPanel.svelte';
import { createOutlineGenerationRunner } from '../../src/modules/nova/services/outline-generation-runner.js';
import { OutlineGenerationStateStore } from '../../src/modules/nova/stores/outline-generation-state.svelte.js';

function createReadiness(
	ok: boolean,
	missing: OutlineContextSufficiencyResult['missing'] = [],
): OutlineContextSufficiencyResult {
	return {
		ok,
		missing,
		warnings: [],
		summary: {
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				premise: null,
			},
			required: {} as OutlineContextSufficiencyResult['summary']['required'],
			enriching: {} as OutlineContextSufficiencyResult['summary']['enriching'],
			sourceCounts: {
				characters: ok ? 1 : 0,
				plotThreads: ok ? 1 : 0,
				locations: 0,
				factions: 0,
				loreEntries: 0,
				timelineEvents: 0,
				themes: 0,
				acceptedCheckpointCharacters: 0,
				acceptedCheckpointPlotThreads: 0,
				acceptedCheckpointPremises: 0,
			},
		},
	};
}

function contextResult(readiness: OutlineContextSufficiencyResult): RagContextResult {
	return {
		contextText: '',
		includedScopes: ['project'],
		warnings: [],
		aiContext: {
			outlineContextPacket: { readiness },
		},
	} as unknown as RagContextResult;
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

async function settle(): Promise<void> {
	for (let i = 0; i < 4; i++) {
		await Promise.resolve();
		await tick();
		flushSync();
	}
}

function mountPanel(props: Record<string, unknown>) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(NovaOutlineGenerationPanel, { target, props });
	return { target, component };
}

function generateButton(target: HTMLElement): HTMLButtonElement {
	const button = target.querySelector(
		'[data-testid="nova-outline-generation-generate"]',
	) as HTMLButtonElement | null;
	if (!button) throw new Error('Expected generate button.');
	return button;
}

describe('NovaOutlineGenerationPanel', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('renders the empty state without loading context when no project is active', async () => {
		const contextLoader = vi.fn();
		const { target, component } = mountPanel({ projectId: null, contextLoader });
		await settle();

		expect(target.textContent).toContain('No project');
		expect(target.textContent).toContain('Open a project');
		expect(generateButton(target).disabled).toBe(true);
		expect(contextLoader).not.toHaveBeenCalled();
		unmount(component);
	});

	it('renders blocked prerequisites and disables generate', async () => {
		const contextLoader = vi.fn(async () =>
			contextResult(
				createReadiness(false, [
					{
						code: 'story_premise_missing',
						band: 'primary_story_premise',
						message: 'Add a logline or story-frame premise.',
					},
					{
						code: 'story_source_missing',
						band: 'character_or_plot_thread',
						message: 'Add at least one character or plot thread.',
					},
				]),
			),
		);
		const { target, component } = mountPanel({ projectId: 'project-1', contextLoader });
		await settle();

		expect(target.textContent).toContain('Context needed');
		expect(target.textContent).toContain('Add a logline or story-frame premise.');
		expect(target.textContent).toContain('Add at least one character or plot thread.');
		expect(generateButton(target).disabled).toBe(true);
		unmount(component);
	});

	it('renders ready state with an enabled trigger', async () => {
		const contextLoader = vi.fn(async () => contextResult(createReadiness(true)));
		const { target, component } = mountPanel({ projectId: 'project-1', contextLoader });
		await settle();

		expect(target.textContent).toContain('Ready');
		expect(target.textContent).toContain('1 characters | 1 plot threads');
		expect(generateButton(target).disabled).toBe(false);
		unmount(component);
	});

	it('disables generate while a run is active', async () => {
		const contextLoader = vi.fn(async () => contextResult(createReadiness(true)));
		const pending = deferred<Response>();
		const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
			const signal = init?.signal;
			return new Promise<Response>((resolve, reject) => {
				const abort = () => {
					const err = new Error('Aborted');
					err.name = 'AbortError';
					reject(err);
				};
				if (signal?.aborted) {
					abort();
					return;
				}
				signal?.addEventListener('abort', abort, { once: true });
				pending.promise.then(resolve, reject);
			});
		});
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const generationState = new OutlineGenerationStateStore({
			runner,
			listCheckpoints: vi.fn(async () => ({})),
		});
		const { target, component } = mountPanel({
			projectId: 'project-1',
			contextLoader,
			generationState,
		});
		await settle();

		generateButton(target).click();
		await settle();

		expect(target.textContent).toContain('Generating');
		expect(generateButton(target).disabled).toBe(true);
		expect(target.querySelector('[data-testid="nova-outline-generation-abort"]')).not.toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const abort = target.querySelector(
			'[data-testid="nova-outline-generation-abort"]',
		) as HTMLButtonElement;
		abort.click();
		await settle();
		expect(target.textContent).toContain('Cancelled');
		unmount(component);
	});

	it('renders failed trigger state and keeps retry available when the route fails', async () => {
		const contextLoader = vi.fn(async () => contextResult(createReadiness(true)));
		const fetchMock = vi.fn(async () =>
			new Response(
				JSON.stringify({
					error: { code: 'no_credentials', message: 'No AI provider credentials configured.' },
				}),
				{ status: 401, headers: { 'content-type': 'application/json' } },
			),
		);
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const generationState = new OutlineGenerationStateStore({
			runner,
			listCheckpoints: vi.fn(async () => ({})),
		});
		const { target, component } = mountPanel({
			projectId: 'project-1',
			contextLoader,
			generationState,
		});
		await settle();

		generateButton(target).click();
		await settle();

		expect(target.textContent).toContain('Failed');
		expect(target.textContent).toContain('No AI provider credentials configured.');
		expect(generateButton(target).textContent).toContain('Retry');
		expect(generateButton(target).disabled).toBe(false);
		unmount(component);
	});
});

describe('NovaOutlineGenerationPanel source contract', () => {
	const source = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaOutlineGenerationPanel.svelte'),
		'utf-8',
	);
	const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

	it('does not introduce raw colors or positive hardcoded spacing in styles', () => {
		const rawSpacingDeclarations = style
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => /\b(?:gap|padding|margin|margin-inline-end):/.test(line))
			.filter((line) => !/:\s*(?:0\b|var\(|unset|auto|calc\()/.test(line));

		expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
		expect(style).not.toMatch(/\brgba?\(/);
		expect(rawSpacingDeclarations).toEqual([]);
		expect(style).not.toMatch(/\b[1-9]\d*px\b/);
	});
});
