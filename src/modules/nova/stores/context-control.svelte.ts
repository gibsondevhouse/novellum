import { untrack } from 'svelte';
import {
	loadNovaContextOverrides,
	saveNovaContextOverrides,
	type NovaContextOverrideMetadata,
} from '$lib/project-metadata.js';

export type ContextControlEntityKind = 'character' | 'location' | 'loreEntry';
export type ContextOverrideState = 'implicit' | 'pinned' | 'excluded';

export interface ContextControlEntity {
	id: string;
	kind: ContextControlEntityKind;
	label: string;
	summary?: string;
}

export type ContextControlSnapshot = NovaContextOverrideMetadata;

interface PersistenceTarget {
	projectId: string;
	sceneId: string;
}

export function estimateContextTokens(value: string): number {
	const normalized = value.trim();
	if (!normalized) return 0;
	return Math.max(1, Math.ceil(normalized.length / 4));
}

function normalizeEntityIds(values: readonly string[]): string[] {
	const ids: string[] = [];
	for (const value of values) {
		const id = value.trim();
		if (!id || ids.includes(id)) continue;
		ids.push(id);
	}
	return ids;
}

function snapshotToOverrides(
	snapshot: ContextControlSnapshot,
): Record<string, Exclude<ContextOverrideState, 'implicit'>> {
	const excludedEntityIds = normalizeEntityIds(snapshot.excludedEntityIds);
	const pinnedEntityIds = normalizeEntityIds(snapshot.pinnedEntityIds).filter(
		(id) => !excludedEntityIds.includes(id),
	);
	const overrides: Record<string, Exclude<ContextOverrideState, 'implicit'>> = {};
	for (const id of pinnedEntityIds) overrides[id] = 'pinned';
	for (const id of excludedEntityIds) overrides[id] = 'excluded';
	return overrides;
}

function sameTarget(a: PersistenceTarget | null, b: PersistenceTarget): boolean {
	return a?.projectId === b.projectId && a.sceneId === b.sceneId;
}

export class ContextControlStore {
	private overrides = $state<Record<string, Exclude<ContextOverrideState, 'implicit'>>>({});
	private entities = $state<Record<string, ContextControlEntity>>({});
	private target = $state<PersistenceTarget | null>(null);
	private loadSequence = 0;
	private saveSequence = 0;

	loading = $state(false);
	saving = $state(false);
	persistenceError = $state<string | null>(null);

	pinnedEntityIds = $derived.by(() =>
		Object.entries(this.overrides)
			.filter(([, state]) => state === 'pinned')
			.map(([id]) => id),
	);

	excludedEntityIds = $derived.by(() =>
		Object.entries(this.overrides)
			.filter(([, state]) => state === 'excluded')
			.map(([id]) => id),
	);

	pinnedEntities = $derived.by(() =>
		this.pinnedEntityIds
			.map((id) => this.entities[id])
			.filter((entity): entity is ContextControlEntity => Boolean(entity)),
	);

	getOverride(entityId: string): ContextOverrideState {
		return this.overrides[entityId] ?? 'implicit';
	}

	getSnapshot(): ContextControlSnapshot {
		return {
			pinnedEntityIds: [...this.pinnedEntityIds],
			excludedEntityIds: [...this.excludedEntityIds],
		};
	}

	registerEntities(entities: readonly ContextControlEntity[]): void {
		if (entities.length === 0) return;
		const existingEntities = untrack(() => this.entities);
		this.entities = {
			...existingEntities,
			...Object.fromEntries(
				entities
					.filter((entity) => entity.id.trim())
					.map((entity) => [entity.id, { ...entity, id: entity.id.trim() }]),
			),
		};
	}

	hydrate(snapshot: ContextControlSnapshot): void {
		this.overrides = snapshotToOverrides(snapshot);
	}

	async loadForScene(projectId: string | null | undefined, sceneId: string | null | undefined): Promise<void> {
		const trimmedProjectId = projectId?.trim() ?? '';
		const trimmedSceneId = sceneId?.trim() ?? '';
		if (!trimmedProjectId || !trimmedSceneId) {
			this.unbind();
			return;
		}

		const nextTarget = { projectId: trimmedProjectId, sceneId: trimmedSceneId };
		if (sameTarget(this.target, nextTarget) && !this.persistenceError) return;

		const sequence = ++this.loadSequence;
		this.target = nextTarget;
		this.loading = true;
		this.persistenceError = null;

		try {
			const snapshot = await loadNovaContextOverrides(nextTarget.projectId, nextTarget.sceneId);
			if (sequence !== this.loadSequence || !sameTarget(this.target, nextTarget)) return;
			this.hydrate(snapshot);
		} catch (error) {
			if (sequence !== this.loadSequence || !sameTarget(this.target, nextTarget)) return;
			this.persistenceError =
				error instanceof Error ? error.message : 'Context overrides could not be loaded.';
			this.hydrate({ pinnedEntityIds: [], excludedEntityIds: [] });
		} finally {
			if (sequence === this.loadSequence && sameTarget(this.target, nextTarget)) {
				this.loading = false;
			}
		}
	}

	unbind(): void {
		this.target = null;
		this.loading = false;
		this.saving = false;
		this.persistenceError = null;
		this.overrides = {};
	}

	setOverride(entityId: string, state: ContextOverrideState): void {
		if (!entityId.trim()) return;
		const normalizedEntityId = entityId.trim();
		if (state === 'implicit') {
			const { [normalizedEntityId]: _removed, ...rest } = this.overrides;
			this.overrides = rest;
			this.persistCurrent();
			return;
		}
		this.overrides = { ...this.overrides, [normalizedEntityId]: state };
		this.persistCurrent();
	}

	togglePinned(entityId: string): void {
		this.setOverride(entityId, this.getOverride(entityId) === 'pinned' ? 'implicit' : 'pinned');
	}

	toggleExcluded(entityId: string): void {
		this.setOverride(entityId, this.getOverride(entityId) === 'excluded' ? 'implicit' : 'excluded');
	}

	clear(options: { persist?: boolean } = {}): void {
		this.overrides = {};
		if (options.persist ?? true) this.persistCurrent();
	}

	private persistCurrent(): void {
		const target = this.target;
		if (!target) return;

		const sequence = ++this.saveSequence;
		const snapshot = this.getSnapshot();
		this.saving = true;
		this.persistenceError = null;

		void saveNovaContextOverrides(target.projectId, target.sceneId, snapshot)
			.catch((error) => {
				if (sequence !== this.saveSequence) return;
				this.persistenceError =
					error instanceof Error ? error.message : 'Context overrides could not be saved.';
			})
			.finally(() => {
				if (sequence === this.saveSequence) this.saving = false;
			});
	}
}

export const contextControl = new ContextControlStore();
