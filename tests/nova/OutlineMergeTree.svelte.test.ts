import { flushSync, mount, tick, unmount } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import OutlineMergeTree from '../../src/modules/nova/components/OutlineMergeTree.svelte';

function createDraft(): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: 'outline-project-1',
		projectId: 'project-1',
		slug: 'outline-project-1',
		title: 'Storm Ledger Outline',
		sourceContext: {
			summary: 'Generated from current project and worldbuilding context.',
			includedDomains: [],
			entityCounts: {},
		},
		arcs: [
			{
				id: 'arc-1',
				slug: 'arc-one',
				title: 'The Courier Breaks Rank',
				order: 0,
				summary: 'Iri moves from obedience to rebellion.',
				purpose: 'Establish the central loyalty fracture.',
				acts: [
					{
						id: 'act-1',
						slug: 'act-one',
						title: 'Act One',
						order: 0,
						summary: 'The ledger surfaces.',
						chapters: [
							{
								id: 'chapter-1',
								slug: 'chapter-one',
								title: 'Chapter One',
								order: 0,
								summary: 'A courier accepts the wrong job.',
								scenes: [
									{
										id: 'scene-1',
										slug: 'scene-one',
										title: 'The Archive Door',
										order: 0,
										summary: 'Iri reaches the locked weather archive.',
										intent: {
											goal: 'Recover the weather ledger before the guild patrol arrives.',
											conflict: 'The archive keeper refuses entry.',
											turn: 'The keeper recognizes Iri.',
											outcome: 'Iri escapes with a partial map.',
										},
										characterIds: ['iri'],
										locationIds: ['archive'],
										plotThreadIds: ['ledger'],
									},
								],
							},
						],
					},
				],
			},
		],
	};
}

async function settle(): Promise<void> {
	await tick();
	flushSync();
}

	function mountTree(disabled = false, onSelectionChange?: (selectedNodeIds: string[]) => void) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(OutlineMergeTree, {
		target,
		props: { draft: createDraft(), disabled, onSelectionChange },
	});
	flushSync();
	return { target, component };
}

function checkbox(target: HTMLElement, nodeId: string): HTMLInputElement {
	const input = target.querySelector<HTMLInputElement>(`[data-node-id="${nodeId}"]`);
	if (!input) throw new Error(`Expected checkbox for ${nodeId}.`);
	return input;
}

function selectedCount(target: HTMLElement): string {
	const count = target.querySelector('[data-testid="outline-merge-selected-count"]');
	return count?.textContent ?? '';
}

describe('OutlineMergeTree', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('renders hierarchy checkboxes and tracks selected node count', async () => {
		const { target, component } = mountTree();

		expect(target.textContent).toContain('Selective merge');
		expect(target.textContent).toContain('Proposed arc');
		expect(target.textContent).toContain('Proposed act');
		expect(target.textContent).toContain('Proposed chapter');
		expect(target.textContent).toContain('Proposed scene');
		expect(selectedCount(target)).toBe('4 selected');
		expect(checkbox(target, 'arc:arc-1').checked).toBe(true);
		expect(checkbox(target, 'scene:scene-1').checked).toBe(true);

		const arc = checkbox(target, 'arc:arc-1');
		arc.checked = false;
		arc.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(selectedCount(target)).toBe('0 selected');
		expect(checkbox(target, 'act:act-1').checked).toBe(false);
		expect(checkbox(target, 'scene:scene-1').checked).toBe(false);

		unmount(component);
	});

	it('auto-checks parent nodes when a child is selected', async () => {
		const { target, component } = mountTree();
		const arc = checkbox(target, 'arc:arc-1');
		arc.checked = false;
		arc.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		const scene = checkbox(target, 'scene:scene-1');
		scene.checked = true;
		scene.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(checkbox(target, 'arc:arc-1').checked).toBe(true);
		expect(checkbox(target, 'act:act-1').checked).toBe(true);
		expect(checkbox(target, 'chapter:chapter-1').checked).toBe(true);
		expect(checkbox(target, 'scene:scene-1').checked).toBe(true);
		expect(selectedCount(target)).toBe('4 selected');

		unmount(component);
	});

	it('publishes selected node ids when the tree changes', async () => {
		const selectionEvents: string[][] = [];
		const { target, component } = mountTree(false, (selectedNodeIds) => {
			selectionEvents.push(selectedNodeIds);
		});
		await settle();

		const arc = checkbox(target, 'arc:arc-1');
		arc.checked = false;
		arc.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		const scene = checkbox(target, 'scene:scene-1');
		scene.checked = true;
		scene.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();

		expect(selectionEvents.at(-1)).toEqual(['arc:arc-1', 'act:act-1', 'chapter:chapter-1', 'scene:scene-1']);
		unmount(component);
	});

	it('disables all checkboxes when the tree is read-only', () => {
		const { target, component } = mountTree(true);

		for (const input of target.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
			expect(input.disabled).toBe(true);
		}

		unmount(component);
	});
});
