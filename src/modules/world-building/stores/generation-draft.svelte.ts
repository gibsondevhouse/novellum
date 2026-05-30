/**
 * Ephemeral state machine for worldbuilding entity generation.
 *
 * Phases:
 *   idle       — nothing happening
 *   generating — waiting for the API response (abortable)
 *   reviewing  — drafts returned, user is reviewing
 *   error      — generation failed
 *
 * The store holds no save logic. Saving is handled by the consumer
 * (GeneratedEntityModal) which calls the appropriate API and then
 * invalidates the page data via SvelteKit navigation.
 */
import { SvelteSet } from 'svelte/reactivity';
import { generateWorldbuildingEntities } from '../services/worldbuilding-generation-service.js';
import type { EntityKind } from '../services/worldbuilding-generation-service.js';

export type GenerationPhase = 'idle' | 'generating' | 'reviewing' | 'error';
export interface GenerationProjectContext {
	title: string;
	genre: string;
	logline: string;
}

let phase = $state<GenerationPhase>('idle');
let entityKind = $state<EntityKind | null>(null);
let drafts = $state<unknown[]>([]);
/**
 * Which draft indexes are checked for batch save.
 * SvelteSet is already reactive — do NOT wrap in $state.
 * Mutate in-place (.clear(), .add(), .delete()) so reactivity propagates.
 */
const selectedIndexes = new SvelteSet<number>([0]);
let errorMessage = $state<string | null>(null);
let projectId = $state<string | null>(null);
let projectContext = $state<GenerationProjectContext | null>(null);
/** True when the last completed generation had no logline/synopsis context. */
let hasContextWarning = $state(false);

/** Non-reactive — AbortController is infrastructure, not UI data. */
let abortController: AbortController | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function selectAllIndexes(count: number): void {
	selectedIndexes.clear();
	for (let i = 0; i < count; i++) {
		selectedIndexes.add(i);
	}
}

function resetSelectedIndexes(): void {
	selectedIndexes.clear();
	selectedIndexes.add(0);
}

// ── Public read-only getters ───────────────────────────────────────────────

export function getPhase(): GenerationPhase {
	return phase;
}
export function getEntityKind(): EntityKind | null {
	return entityKind;
}
export function getDrafts(): unknown[] {
	return drafts;
}
export function getSelectedIndexes(): SvelteSet<number> {
	return selectedIndexes;
}
export function getErrorMessage(): string | null {
	return errorMessage;
}
export function getProjectId(): string | null {
	return projectId;
}
export function getProjectContext(): GenerationProjectContext | null {
	return projectContext;
}
export function hasWarning(): boolean {
	return hasContextWarning;
}

// Convenience derived booleans
export function isGenerating(): boolean {
	return phase === 'generating';
}
export function isReviewing(): boolean {
	return phase === 'reviewing';
}
export function isIdle(): boolean {
	return phase === 'idle';
}

// ── Actions ────────────────────────────────────────────────────────────────

export async function startGeneration(
	pid: string,
	kind: EntityKind,
	count: 1 | 3 | 5,
	context?: string,
): Promise<void> {
	if (phase === 'generating') return; // already in-flight

	abortController = new AbortController();
	phase = 'generating';
	entityKind = kind;
	projectId = pid;
	drafts = [];
	errorMessage = null;
	hasContextWarning = false;
	projectContext = null;
	resetSelectedIndexes();

	try {
		const result = await generateWorldbuildingEntities({
			projectId: pid,
			entityKind: kind,
			count,
			context,
			signal: abortController.signal,
		});

		drafts = result.drafts;
		projectContext = result.projectContext;
		hasContextWarning = result.warning === 'logline_missing';
		// Select all drafts by default
		selectAllIndexes(result.drafts.length);
		phase = 'reviewing';
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			// User aborted — silently return to idle
			phase = 'idle';
			return;
		}
		errorMessage = err instanceof Error ? err.message : 'Generation failed. Please try again.';
		phase = 'error';
	} finally {
		abortController = null;
	}
}

export function abortGeneration(): void {
	abortController?.abort();
	abortController = null;
	phase = 'idle';
}

export function toggleDraftSelect(index: number): void {
	if (selectedIndexes.has(index)) {
		selectedIndexes.delete(index);
	} else {
		selectedIndexes.add(index);
	}
}

export function resetGeneration(): void {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}
	phase = 'idle';
	entityKind = null;
	drafts = [];
	resetSelectedIndexes();
	errorMessage = null;
	projectId = null;
	projectContext = null;
	hasContextWarning = false;
}
