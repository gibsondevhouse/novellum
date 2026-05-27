import type { WorldbuildCheckpointRecord, CheckpointLifecycle } from '$lib/ai/pipeline/checkpoint-contract.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import {
	acceptWorldbuildCheckpoint,
	listProjectMetadata,
	rejectWorldbuildCheckpoint,
	reviewWorldbuildCheckpoint,
	upsertWorldbuildCheckpoint,
} from '$lib/project-metadata.js';

let activeProjectId: string | null = $state(null);
let selectedTab: 'characters' | 'locations' | 'lore' | 'plot-threads' | 'timeline' =
	$state('characters');
let selectedEntityId: string | null = $state(null);
let isLoading: boolean = $state(false);
let worldbuildCheckpoints: WorldbuildCheckpointRecord[] = $state([]);
let checkpointError: string | null = $state(null);

export type CheckpointQueueFilter = 'all' | 'pending' | 'accepted' | 'rejected';
let checkpointQueueFilter: CheckpointQueueFilter = $state('all');
let selectedReviewCheckpointId: string | null = $state(null);

const hasSelection = $derived(selectedEntityId !== null);

function isCheckpointRecord(value: unknown): value is WorldbuildCheckpointRecord {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
	const record = value as Partial<WorldbuildCheckpointRecord>;
	return (
		typeof record.id === 'string' &&
		typeof record.lifecycle === 'string' &&
		typeof record.updatedAt === 'string' &&
		typeof record.taskKey === 'string' &&
		typeof record.artifact === 'object' &&
		record.artifact !== null
	);
}

function upsertCheckpointLocal(checkpoint: WorldbuildCheckpointRecord): void {
	const next = [...worldbuildCheckpoints.filter((item) => item.id !== checkpoint.id), checkpoint];
	next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	worldbuildCheckpoints = next;
}

function requireActiveProjectId(): string {
	if (!activeProjectId) {
		throw new Error('No active project selected for worldbuild checkpoint operations.');
	}
	return activeProjectId;
}

export function setSelectedTab(tab: typeof selectedTab): void {
	selectedTab = tab;
}
export function setSelectedEntity(id: string | null): void {
	selectedEntityId = id;
}
export function setActiveProject(projectId: string | null): void {
	activeProjectId = projectId;
}
export function setLoading(v: boolean): void {
	isLoading = v;
}

export async function refreshWorldbuildCheckpoints(projectId: string | null = activeProjectId): Promise<void> {
	if (!projectId) {
		worldbuildCheckpoints = [];
		checkpointError = null;
		return;
	}

	try {
		const entries = await listProjectMetadata(
			projectId,
			'pipeline',
			WORLDBUILD_CHECKPOINT_OWNER_ID,
		);
		const parsed = Object.values(entries)
			.filter((value): value is WorldbuildCheckpointRecord => isCheckpointRecord(value))
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
		worldbuildCheckpoints = parsed;
		checkpointError = null;
	} catch (error) {
		checkpointError = error instanceof Error ? error.message : 'Failed to load worldbuild checkpoints.';
	}
}

export async function stageWorldbuildCheckpoint(
	checkpointId: string,
	value: unknown,
): Promise<WorldbuildCheckpointRecord> {
	const projectId = requireActiveProjectId();
	const checkpoint = await upsertWorldbuildCheckpoint(projectId, checkpointId, value);
	upsertCheckpointLocal(checkpoint);
	checkpointError = null;
	return checkpoint;
}

export async function sendWorldbuildCheckpointToReview(
	checkpointId: string,
	input: { reviewer?: string; note?: string } = {},
): Promise<WorldbuildCheckpointRecord> {
	const projectId = requireActiveProjectId();
	const checkpoint = await reviewWorldbuildCheckpoint(projectId, checkpointId, input);
	upsertCheckpointLocal(checkpoint);
	checkpointError = null;
	return checkpoint;
}

export async function acceptStagedWorldbuildCheckpoint(
	checkpointId: string,
	input: { acceptedBy?: string; note?: string } = {},
): Promise<WorldbuildCheckpointRecord> {
	const projectId = requireActiveProjectId();
	const checkpoint = await acceptWorldbuildCheckpoint(projectId, checkpointId, input);
	upsertCheckpointLocal(checkpoint);
	checkpointError = null;
	return checkpoint;
}

export async function rejectStagedWorldbuildCheckpoint(
	checkpointId: string,
	reason: string,
	input: { rejectedBy?: string } = {},
): Promise<WorldbuildCheckpointRecord> {
	const projectId = requireActiveProjectId();
	const checkpoint = await rejectWorldbuildCheckpoint(projectId, checkpointId, {
		reason,
		rejectedBy: input.rejectedBy,
	});
	upsertCheckpointLocal(checkpoint);
	checkpointError = null;
	return checkpoint;
}

export function getActiveProjectId() {
	return activeProjectId;
}
export function getSelectedTab() {
	return selectedTab;
}
export function getSelectedEntityId() {
	return selectedEntityId;
}
export function getIsLoading() {
	return isLoading;
}
export function getHasSelection() {
	return hasSelection;
}
export function getWorldbuildCheckpoints() {
	return worldbuildCheckpoints;
}
export function getWorldbuildCheckpointError() {
	return checkpointError;
}

export function getCheckpointsByLifecycle(
	lifecycle: WorldbuildCheckpointRecord['lifecycle'],
): WorldbuildCheckpointRecord[] {
	return worldbuildCheckpoints.filter((c) => c.lifecycle === lifecycle);
}

export function getCheckpointById(
	checkpointId: string,
): WorldbuildCheckpointRecord | undefined {
	return worldbuildCheckpoints.find((c) => c.id === checkpointId);
}

export function getLatestCheckpointByLifecycle(
	lifecycle: WorldbuildCheckpointRecord['lifecycle'],
): WorldbuildCheckpointRecord | undefined {
	return worldbuildCheckpoints.find((c) => c.lifecycle === lifecycle);
}

const PENDING_LIFECYCLES: ReadonlySet<CheckpointLifecycle> = new Set(['draft', 'review']);

export function setCheckpointQueueFilter(filter: CheckpointQueueFilter): void {
	checkpointQueueFilter = filter;
}

export function getCheckpointQueueFilter(): CheckpointQueueFilter {
	return checkpointQueueFilter;
}

export function setSelectedReviewCheckpoint(id: string | null): void {
	selectedReviewCheckpointId = id;
}

export function getSelectedReviewCheckpointId(): string | null {
	return selectedReviewCheckpointId;
}

export function getSelectedReviewCheckpoint(): WorldbuildCheckpointRecord | undefined {
	if (!selectedReviewCheckpointId) return undefined;
	return worldbuildCheckpoints.find((c) => c.id === selectedReviewCheckpointId);
}

export function getFilteredCheckpoints(): WorldbuildCheckpointRecord[] {
	if (checkpointQueueFilter === 'all') return worldbuildCheckpoints;
	if (checkpointQueueFilter === 'pending') {
		return worldbuildCheckpoints.filter((c) => PENDING_LIFECYCLES.has(c.lifecycle));
	}
	return worldbuildCheckpoints.filter((c) => c.lifecycle === checkpointQueueFilter);
}

export function getCheckpointQueueCounts(): Record<CheckpointQueueFilter, number> {
	let pending = 0;
	let accepted = 0;
	let rejected = 0;
	for (const c of worldbuildCheckpoints) {
		if (PENDING_LIFECYCLES.has(c.lifecycle)) pending++;
		if (c.lifecycle === 'accepted') accepted++;
		if (c.lifecycle === 'rejected') rejected++;
	}
	return { all: worldbuildCheckpoints.length, pending, accepted, rejected };
}
