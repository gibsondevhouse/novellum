import { describe, expect, it, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import {
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	type BrainstormSession,
} from '$lib/ai/types.js';
import NovaMessageLog from '$modules/nova/components/NovaMessageLog.svelte';
import type { NovaMessage } from '$modules/nova/types.js';

const session: BrainstormSession = {
	schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
	seedIdea: 'A court cartographer notices the coastline changes whenever someone lies.',
	proposals: {
		premiseVariants: [
			{
				id: 'premise-1',
				category: 'premise_variant',
				title: 'False Coast',
				description: 'Each official lie redraws the shore.',
				rationale: 'Turns the seed into a reviewable premise.',
				worldbuildSeedTarget: 'premise_note',
			},
		],
		thematicThreads: [],
		genreHooks: [],
		protagonistSketches: [],
	},
};

describe('NovaMessageLog brainstorm artifact rendering', () => {
	it('renders BrainstormSession proposals without an inline input form', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const messages: NovaMessage[] = [
			{
				id: 'message-1',
				role: 'nova',
				content: '',
				status: 'complete',
				createdAt: '2026-06-25T19:30:00.000Z',
				artifact: { kind: 'brainstorm-session', session },
			},
		];

		const cmp = mount(NovaMessageLog, {
			target,
			props: {
				messages,
				novaError: null,
				novaErrorType: null,
				onRetry: vi.fn(),
				projectId: 'project-1',
			},
		});
		flushSync();

		expect(target.querySelector('[data-testid="nova-brainstorm-session"]')).not.toBeNull();
		expect(target.querySelector('[data-testid="nova-brainstorm-proposals"]')).not.toBeNull();
		expect(target.querySelector('[data-testid="nova-brainstorm-input"]')).toBeNull();
		expect(target.textContent).toContain('False Coast');
		expect(target.textContent).toContain('Premise variants');
		unmount(cmp);
	});
});
