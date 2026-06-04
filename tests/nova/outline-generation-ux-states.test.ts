import { describe, expect, it, beforeEach, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { RagContextResult } from '../../src/modules/nova/types.js';
import type { OutlineContextSufficiencyResult } from '../../src/lib/ai/pipeline/outline-context-sufficiency.js';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import NovaOutlineGenerationPanel from '../../src/modules/nova/components/NovaOutlineGenerationPanel.svelte';
import NovaOutlineDraftCheckpointCard from '../../src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte';
import { OutlineGenerationStateStore } from '../../src/modules/nova/stores/outline-generation-state.svelte.js';
import {
	OutlineCheckpointActionError,
	type OutlineCheckpointActions,
} from '../../src/modules/nova/services/outline-checkpoint-actions.js';

const now = '2026-06-03T15:00:00.000Z';

function createReadiness(
	ok: boolean,
	missing: OutlineContextSufficiencyResult['missing'] = [],
): OutlineContextSufficiencyResult {
	return {
		ok,
		missing,
		warnings: [],
		summary: {
			project: { id: 'project-1', title: 'Storm Ledger', premise: null },
			required: {} as OutlineContextSufficiencyResult['summary']['required'],
			enriching: {} as OutlineContextSufficiencyResult['summary']['enriching'],
			sourceCounts: {
				characters: ok ? 2 : 0,
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

function createDraft(projectId = 'project-1'): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${projectId}`,
		projectId,
		slug: `outline-${projectId}`,
		title: 'Storm Ledger Outline',
		sourceContext: {
			summary: 'Generated from current worldbuilding context.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 2, plotThreads: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: 'arc-1',
				slug: 'arc-one',
				title: 'Arc One',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: 'act-1',
						slug: 'act-one',
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: 'chapter-1',
								slug: 'chapter-one',
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: 'scene-1',
										slug: 'scene-one',
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Recover the ledger.',
											conflict: 'A rival blocks the archive.',
											turn: 'The ledger names the protagonist.',
											outcome: 'The protagonist inherits the conspiracy.',
										},
										characterIds: ['char-1'],
										locationIds: [],
										plotThreadIds: [],
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

function createCheckpoint(
	lifecycle: OutlineDraftCheckpointRecord['lifecycle'] = 'review',
): OutlineDraftCheckpointRecord {
	return {
		id: 'checkpoint-1',
		projectId: 'project-1',
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle,
		draft: createDraft(),
		createdAt: now,
		updatedAt: now,
		review:
			lifecycle === 'review'
				? { reviewedAt: now, reviewer: 'outline-generation-route', note: 'Ready.' }
				: null,
		acceptance:
			lifecycle === 'accepted'
				? {
						acceptedAt: now,
						acceptedBy: 'author',
						note: '',
						projectionMode: 'atomic',
						materializedCounts: {
							arcs: 1,
							acts: 1,
							milestones: 0,
							chapters: 1,
							scenes: 1,
							beats: 0,
							stages: 0,
						},
						hierarchyRootIds: {
							arcIds: ['arc-project-1'],
						},
						sceneIntentPersisted: true,
					}
				: null,
		rejection:
			lifecycle === 'rejected'
				? { rejectedAt: now, rejectedBy: 'author', reason: 'Too much plot too early.' }
				: null,
	};
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

function mountCard(props: {
	checkpoint: OutlineDraftCheckpointRecord;
	actions: OutlineCheckpointActions;
}) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(NovaOutlineDraftCheckpointCard, { target, props });
	flushSync();
	return { target, component };
}

describe('outline generation UX states', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('explains empty, blocked, and ready states with labelled actions', async () => {
		const empty = mountPanel({ projectId: null, contextLoader: vi.fn() });
		await settle();
		expect(empty.target.textContent).toContain('Open a project to prepare outline generation.');
		expect(
			(empty.target.querySelector('[data-testid="nova-outline-generation-generate"]') as HTMLButtonElement)
				.getAttribute('aria-label'),
		).toBe('Generate outline proposal');
		unmount(empty.component);

		const blocked = mountPanel({
			projectId: 'project-1',
			contextLoader: vi.fn(async () =>
				contextResult(
					createReadiness(false, [
						{
							code: 'story_source_missing',
							band: 'character_or_plot_thread',
							message: 'Add at least one character or plot thread.',
						},
					]),
				),
			),
		});
		await settle();
		expect(blocked.target.textContent).toContain('Add the missing signals, then refresh context.');
		expect(blocked.target.querySelector('[aria-label="Missing outline prerequisites"]')).not.toBeNull();
		expect(blocked.target.querySelector('[aria-label="Refresh outline context"]')).not.toBeNull();
		unmount(blocked.component);

		const ready = mountPanel({
			projectId: 'project-1',
			contextLoader: vi.fn(async () => contextResult(createReadiness(true))),
		});
		await settle();
		expect(ready.target.textContent).toContain('Generate creates a review-only checkpoint.');
		expect(ready.target.textContent).toContain('2 characters | 1 plot threads');
		unmount(ready.component);
	});

	it('renders accepted and rejected panel states with next-action copy', async () => {
		const generationState = new OutlineGenerationStateStore({
			listCheckpoints: vi.fn(async () => ({})),
		});
		const panel = mountPanel({
			projectId: 'project-1',
			contextLoader: vi.fn(async () => contextResult(createReadiness(true))),
			generationState,
		});
		await settle();

		generationState.applyCheckpointActionResult(createCheckpoint('accepted'));
		await settle();
		expect(panel.target.textContent).toContain('Accepted');
		expect(panel.target.textContent).toContain('Refresh to verify current outline state.');

		generationState.applyCheckpointActionResult(createCheckpoint('rejected'));
		await settle();
		expect(panel.target.textContent).toContain('Rejected');
		expect(panel.target.textContent).toContain('Generate again when ready.');
		unmount(panel.component);
	});

	it('labels conflict-blocked accept as blocked, not successful', async () => {
		const actions: OutlineCheckpointActions = {
			review: vi.fn(async (input: Parameters<OutlineCheckpointActions['review']>[0]) => ({
				checkpoint: input.checkpoint,
			})),
			accept: vi.fn(async () => {
				throw new OutlineCheckpointActionError(
					409,
					'Existing outline hierarchy is populated.',
					'outline_conflict',
				);
			}),
			reject: vi.fn(async () => ({ checkpoint: createCheckpoint('rejected') })),
		};
		const { target, component } = mountCard({ checkpoint: createCheckpoint('review'), actions });

		expect(target.querySelector('[aria-label="Accept proposed outline checkpoint"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Reject proposed outline checkpoint"]')).not.toBeNull();

		(target.querySelector('[data-testid="nova-outline-accept"]') as HTMLButtonElement).click();
		flushSync();
		(target.querySelector('[data-testid="nova-outline-confirm-accept"]') as HTMLButtonElement).click();
		await settle();

		expect(target.textContent).toContain('Accept blocked.');
		expect(target.textContent).toContain('Existing outline hierarchy is populated.');
		expect(target.textContent).not.toContain('Accepted outline checkpoint.');
		unmount(component);
	});
});
