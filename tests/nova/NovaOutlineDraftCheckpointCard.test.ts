import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import NovaOutlineDraftCheckpointCard from '../../src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte';
import {
	OutlineCheckpointActionError,
	type OutlineCheckpointActions,
} from '../../src/modules/nova/services/outline-checkpoint-actions.js';

const now = '2026-06-03T14:45:00.000Z';

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
			summary: 'Generated from current project and worldbuilding context.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 2, plotThreads: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
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
											conflict: 'The archive keeper refuses entry without a dead courier token.',
											turn: 'The keeper recognizes Iri from the ledger index.',
											outcome: 'Iri escapes with a partial map and a public accusation.',
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
				? {
						reviewedAt: now,
						reviewer: 'outline-generation-route',
						note: 'Ready for author review.',
					}
				: null,
		acceptance:
			lifecycle === 'accepted'
				? {
						acceptedAt: now,
						acceptedBy: 'author',
						note: 'Looks good.',
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
				? {
						rejectedAt: now,
						rejectedBy: 'author',
						reason: 'Too much plot too early.',
					}
				: null,
	};
}

function mountCard(checkpoint = createCheckpoint()) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(NovaOutlineDraftCheckpointCard, {
		target,
		props: { checkpoint },
	});
	flushSync();
	return { target, component };
}

function mountCardWithProps(
	checkpoint = createCheckpoint(),
	props: Partial<{
		projectId: string | null;
		actions: OutlineCheckpointActions;
		onCheckpointUpdated: (checkpoint: OutlineDraftCheckpointRecord) => void;
	}> = {},
) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(NovaOutlineDraftCheckpointCard, {
		target,
		props: { checkpoint, ...props },
	});
	flushSync();
	return { target, component };
}

async function settle(): Promise<void> {
	for (let i = 0; i < 4; i++) {
		await Promise.resolve();
		await tick();
		flushSync();
	}
}

function createActions(
	overrides: Partial<OutlineCheckpointActions> = {},
): OutlineCheckpointActions {
	return {
		review: vi.fn(async (input: Parameters<OutlineCheckpointActions['review']>[0]) => ({
			checkpoint: input.checkpoint,
		})),
		accept: vi.fn(async () => ({ checkpoint: createCheckpoint('accepted') })),
		reject: vi.fn(async () => ({ checkpoint: createCheckpoint('rejected') })),
		...overrides,
	};
}

describe('NovaOutlineDraftCheckpointCard', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('renders all required hierarchy levels from a valid checkpoint', () => {
		const { target, component } = mountCard();

		expect(target.textContent).toContain('Proposed outline');
		expect(target.textContent).toContain('Pending review');
		expect(target.textContent).toContain('Proposed arc');
		expect(target.textContent).toContain('The Courier Breaks Rank');
		expect(target.textContent).toContain('Proposed act');
		expect(target.textContent).toContain('Act One');
		expect(target.textContent).toContain('Proposed chapter');
		expect(target.textContent).toContain('Chapter One');
		expect(target.textContent).toContain('Proposed scene');
		expect(target.textContent).toContain('The Archive Door');
		unmount(component);
	});

	it('shows scene intent fields and source context metadata', () => {
		const { target, component } = mountCard();

		expect(target.textContent).toContain('Goal');
		expect(target.textContent).toContain('Recover the weather ledger');
		expect(target.textContent).toContain('Conflict');
		expect(target.textContent).toContain('archive keeper refuses entry');
		expect(target.textContent).toContain('Turn');
		expect(target.textContent).toContain('recognizes Iri');
		expect(target.textContent).toContain('Outcome');
		expect(target.textContent).toContain('partial map');
		expect(target.textContent).toContain('Generated');
		expect(target.textContent).toContain('ctx-123');
		expect(target.textContent).toContain('characters: 2');
		unmount(component);
	});

	it('renders accepted and rejected lifecycle variants distinctly', () => {
		const accepted = mountCard(createCheckpoint('accepted'));
		expect(accepted.target.textContent).toContain('Accepted outline');
		expect(accepted.target.textContent).toContain('Accepted arc');
		expect(accepted.target.textContent).toContain('Accepted scene');
		unmount(accepted.component);

		const rejected = mountCard(createCheckpoint('rejected'));
		expect(rejected.target.textContent).toContain('Rejected outline');
		expect(rejected.target.textContent).toContain('Rejected arc');
		expect(rejected.target.textContent).toContain('Rejected scene');
		unmount(rejected.component);
	});

	it('requires explicit confirmation before accepting and uses the returned checkpoint', async () => {
		const accepted = createCheckpoint('accepted');
		const actions = createActions({
			accept: vi.fn(async () => ({ checkpoint: accepted, materialization: { scenes: 1 } })),
		});
		const onCheckpointUpdated = vi.fn();
		const { target, component } = mountCardWithProps(createCheckpoint('review'), {
			actions,
			onCheckpointUpdated,
		});

		const accept = target.querySelector('[data-testid="nova-outline-accept"]') as HTMLButtonElement;
		accept.click();
		flushSync();

		expect(actions.accept).not.toHaveBeenCalled();
		expect(target.textContent).toContain('Confirm accept');

		const confirm = target.querySelector(
			'[data-testid="nova-outline-confirm-accept"]',
		) as HTMLButtonElement;
		confirm.click();
		await settle();

		expect(actions.accept).toHaveBeenCalledWith(
			expect.objectContaining({
				projectId: 'project-1',
				acceptedBy: 'author',
				checkpoint: expect.objectContaining({ id: 'checkpoint-1', lifecycle: 'review' }),
			}),
		);
		expect(onCheckpointUpdated).toHaveBeenCalledWith(accepted);
		expect(target.textContent).toContain('Accepted outline');
		expect(target.textContent).toContain('Accepted outline checkpoint.');
		unmount(component);
	});

	it('requires a rejection reason and renders the returned rejected checkpoint', async () => {
		const rejected = createCheckpoint('rejected');
		const actions = createActions({
			reject: vi.fn(async () => ({ checkpoint: rejected })),
		});
		const { target, component } = mountCardWithProps(createCheckpoint('review'), { actions });

		const reject = target.querySelector('[data-testid="nova-outline-reject"]') as HTMLButtonElement;
		reject.click();
		flushSync();

		const confirm = target.querySelector(
			'[data-testid="nova-outline-confirm-reject"]',
		) as HTMLButtonElement;
		expect(confirm.disabled).toBe(true);

		const input = target.querySelector(
			'[data-testid="nova-outline-reject-reason"]',
		) as HTMLTextAreaElement;
		input.value = ' Too structural. ';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		expect(confirm.disabled).toBe(false);

		confirm.click();
		await settle();

		expect(actions.reject).toHaveBeenCalledWith(
			expect.objectContaining({
				projectId: 'project-1',
				rejectedBy: 'author',
				reason: 'Too structural.',
			}),
		);
		expect(target.textContent).toContain('Rejected outline');
		expect(target.textContent).toContain('Too much plot too early.');
		unmount(component);
	});

	it('shows accept conflicts without mutating the displayed checkpoint', async () => {
		const actions = createActions({
			accept: vi.fn(async () => {
				throw new OutlineCheckpointActionError(
					409,
					'Existing outline hierarchy is populated.',
					'outline_conflict',
				);
			}),
		});
		const onCheckpointUpdated = vi.fn();
		const { target, component } = mountCardWithProps(createCheckpoint('review'), {
			actions,
			onCheckpointUpdated,
		});

		(target.querySelector('[data-testid="nova-outline-accept"]') as HTMLButtonElement).click();
		flushSync();
		(target.querySelector('[data-testid="nova-outline-confirm-accept"]') as HTMLButtonElement).click();
		await settle();

		expect(target.textContent).toContain('Existing outline hierarchy is populated.');
		expect(target.textContent).toContain('Pending review');
		expect(onCheckpointUpdated).not.toHaveBeenCalled();
		unmount(component);
	});

	it('shows rollback recovery copy without raw database internals', async () => {
		const actions = createActions({
			accept: vi.fn(async () => {
				throw new OutlineCheckpointActionError(
					500,
					'SQLITE_CONSTRAINT: forced checkpoint update failure',
					'materialization_failed',
				);
			}),
		});
		const onCheckpointUpdated = vi.fn();
		const { target, component } = mountCardWithProps(createCheckpoint('review'), {
			actions,
			onCheckpointUpdated,
		});

		(target.querySelector('[data-testid="nova-outline-accept"]') as HTMLButtonElement).click();
		flushSync();
		(target.querySelector('[data-testid="nova-outline-confirm-accept"]') as HTMLButtonElement).click();
		await settle();

		expect(target.textContent).toContain('Materialization failed and was rolled back.');
		expect(target.textContent).toContain('Pending review');
		expect(target.textContent).not.toContain('SQLITE_CONSTRAINT');
		expect(target.textContent).not.toContain('forced checkpoint update failure');
		expect(onCheckpointUpdated).not.toHaveBeenCalled();
		unmount(component);
	});
});

describe('NovaOutlineDraftCheckpointCard source contract', () => {
	const source = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte'),
		'utf-8',
	);

	it('keeps review actions behind the Nova action service boundary', () => {
		expect(source).toContain('Proposed');
		expect(source).toContain('Pending review');
		expect(source).toContain('createOutlineCheckpointActions');
		expect(source).not.toContain('setProjectMetadata');
		expect(source).not.toContain('$lib/project-metadata');
		expect(source).not.toContain('$lib/server');
		expect(source).not.toContain('better-sqlite3');
		expect(source).not.toContain('$modules/editor');
		expect(source).not.toContain('updateScene');
	});
});
