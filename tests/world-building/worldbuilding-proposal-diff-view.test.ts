import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import WorldbuildingProposalDiffView from '$modules/world-building/components/WorldbuildingProposalDiffView.svelte';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

const NOW = '2026-06-12T18:00:00.000Z';

function makeProposal(overrides: Partial<WorldbuildProposalRecord> = {}): WorldbuildProposalRecord {
	return {
		proposalId: 'proposal-1',
		projectId: 'project-1',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: NOW,
		sourceContext: {
			title: 'Signal Fire',
			genre: 'fantasy',
			logline: 'A courier outruns a civil war.',
			synopsisHash: 'abc12345',
		},
		confidence: 0.8,
		reasoningSummary: 'Adds a pressure-tested witness.',
		payload: {
			name: 'Ari Quill',
			bio: 'A memory courier navigating state collapse.',
			traits: ['precise', 'restless'],
		},
		dedupeKey: 'personae:character:ari quill',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

describe('WorldbuildingProposalDiffView.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('renders proposal payload fields and duplicate candidates without a canon diff', () => {
		const component = mount(WorldbuildingProposalDiffView, {
			target,
			props: {
				proposal: makeProposal({
					duplicateCandidates: [
						{
							displayName: 'Ari Quill',
							identifier: 'Ari Quill',
							dedupeKey: 'personae:character:ari quill',
							matchKind: 'exact_key',
							score: 1,
							evidence: [
								{
									kind: 'exact_key',
									label: 'Exact normalized name/title match in existing canon.',
									score: 1,
								},
							],
						},
					],
				}),
			},
		});
		flushSync();

		expect(target.textContent).toContain('Create proposal');
		expect(target.textContent).toContain('Ari Quill');
		expect(target.textContent).toContain('Possible duplicate');
		expect(target.textContent).toContain('exact key');

		unmount(component);
	});

	it('renders create field diffs with current and proposed values', () => {
		const component = mount(WorldbuildingProposalDiffView, {
			target,
			props: {
				proposal: makeProposal({
					canonDiff: {
						diffId: 'diff-create',
						proposalId: 'proposal-1',
						projectId: 'project-1',
						categoryId: 'personae',
						entityKind: 'character',
						family: 'character',
						generatedAt: NOW,
						summary: 'Create Ari Quill as a new character.',
						confidence: 0.84,
						decision: 'create',
						target: null,
						fields: [
							{
								fieldPath: 'bio',
								label: 'Bio',
								valueType: 'string',
								operation: 'add',
								before: null,
								after: 'A memory courier navigating state collapse.',
								evidence: [],
							},
						],
						links: [],
						duplicateCandidates: [],
						evidence: [],
					},
				}),
			},
		});
		flushSync();

		expect(target.textContent).toContain('Create canon record');
		expect(target.textContent).toContain('Current');
		expect(target.textContent).toContain('Empty');
		expect(target.textContent).toContain('Proposed');
		expect(target.textContent).toContain('A memory courier navigating state collapse.');

		unmount(component);
	});

	it('renders merge target and duplicate evidence for merge diffs', () => {
		const targetRef = {
			family: 'character' as const,
			id: 'character-1',
			displayName: 'Ari Quill',
			table: 'characters',
			projectId: 'project-1',
		};
		const component = mount(WorldbuildingProposalDiffView, {
			target,
			props: {
				proposal: makeProposal({
					canonDiff: {
						diffId: 'diff-merge',
						proposalId: 'proposal-1',
						projectId: 'project-1',
						categoryId: 'personae',
						entityKind: 'character',
						family: 'character',
						generatedAt: NOW,
						summary: 'Merge proposed details into Ari Quill.',
						confidence: 0.92,
						decision: 'merge',
						target: targetRef,
						fields: [
							{
								fieldPath: 'traits',
								valueType: 'array',
								operation: 'append',
								before: ['precise'],
								after: ['precise', 'restless'],
								evidence: [],
							},
						],
						links: [],
						duplicateCandidates: [
							{
								target: targetRef,
								matchKind: 'normalized_name',
								score: 0.94,
								evidence: [
									{
										kind: 'normalized_name',
										label: 'Names match after normalization.',
										score: 0.94,
										target: targetRef,
									},
								],
							},
						],
						evidence: [],
					},
				}),
			},
		});
		flushSync();

		expect(target.textContent).toContain('Merge with existing canon');
		expect(target.textContent).toContain('Target');
		expect(target.textContent).toContain('Ari Quill');
		expect(target.textContent).toContain('precise, restless');
		expect(target.textContent).toContain('Names match after normalization.');

		unmount(component);
	});
});
