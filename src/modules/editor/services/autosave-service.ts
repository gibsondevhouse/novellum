import { updateScene } from './scene-repository.js';
import { createSnapshot } from './snapshot-repository.js';
import {
	AUTOSAVE_DEBOUNCE_MS,
	AUTOSAVE_RETRY_DELAYS_MS,
	type AutosaveResult,
	type AutosaveSubscriber,
} from './autosave-types.js';

/**
 * Autosave service — single-subscriber, single-active-scene.
 *
 * The editor route mounts the service for the active scene, schedules
 * text on every keystroke (debounced), and unmounts on navigation.
 * Failures are not silent: the service retains the pending draft and
 * retries on a bounded backoff, surfacing a `failed` result in
 * between. Phase-004 (recovery service) consumes the same pending
 * draft state to recover after a crash.
 */

interface MountedState {
	sceneId: string;
	projectId: string;
	subscriber: AutosaveSubscriber | null;
}

let state: MountedState | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let pending: string | null = null;
let attempt = 0;
let lastSavedAt: string | null = null;
let lastResult: AutosaveResult = freshIdle();
let inflight: Promise<void> | null = null;

function freshIdle(): AutosaveResult {
	return { status: 'idle', savedAt: null, error: null, pendingDraft: null, attempt: 0 };
}

function emit(next: AutosaveResult): void {
	lastResult = next;
	state?.subscriber?.(next);
}

function clearTimers(): void {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
}

/**
 * Strips anything that might leak credentials, env values, or stack
 * traces from a thrown error before it reaches the UI subscriber.
 */
function sanitiseError(err: unknown): string {
	if (err instanceof Error && err.message) {
		return err.message.split('\n', 1)[0]?.slice(0, 200) ?? 'Save failed';
	}
	return 'Save failed';
}

export function mount(
	sceneId: string,
	projectId: string,
	subscriber?: AutosaveSubscriber,
): void {
	clearTimers();
	pending = null;
	attempt = 0;
	lastSavedAt = null;
	state = { sceneId, projectId, subscriber: subscriber ?? null };
	emit(freshIdle());
}

export function unmount(): void {
	clearTimers();
	state = null;
	pending = null;
	attempt = 0;
	lastSavedAt = null;
	inflight = null;
	lastResult = freshIdle();
}

export function getResult(): AutosaveResult {
	return lastResult;
}

export function schedule(text: string): void {
	if (!state) return;
	pending = text;
	// Fresh keystroke resets the retry budget so users can recover from
	// a previously failed save by simply continuing to type.
	attempt = 0;
	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
	if (debounceTimer) clearTimeout(debounceTimer);
	emit({
		status: 'saving',
		savedAt: lastSavedAt,
		error: null,
		pendingDraft: text,
		attempt: 0,
	});
	debounceTimer = setTimeout(() => {
		debounceTimer = null;
		void runFlush();
	}, AUTOSAVE_DEBOUNCE_MS);
}

export async function flushNow(): Promise<void> {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
	await runFlush();
}

async function runFlush(): Promise<void> {
	if (inflight) {
		await inflight;
		return;
	}
	if (!state || pending === null) return;
	inflight = (async () => {
		const text = pending as string;
		const mounted = state;
		if (!mounted) return;
		emit({
			status: 'saving',
			savedAt: lastSavedAt,
			error: null,
			pendingDraft: text,
			attempt,
		});
		const now = new Date().toISOString();
		try {
			await updateScene(mounted.sceneId, { content: text, updatedAt: now });
			if (text.trim().length > 0) {
				await createSnapshot(mounted.sceneId, mounted.projectId, text);
			}
			pending = null;
			attempt = 0;
			lastSavedAt = now;
			emit({
				status: 'saved',
				savedAt: now,
				error: null,
				pendingDraft: null,
				attempt: 0,
			});
		} catch (err) {
			scheduleRetry(sanitiseError(err), text);
		}
	})();
	try {
		await inflight;
	} finally {
		inflight = null;
	}
}

function scheduleRetry(message: string, text: string): void {
	const nextDelay = AUTOSAVE_RETRY_DELAYS_MS[attempt];
	const failedResult: AutosaveResult = {
		status: 'failed',
		savedAt: lastSavedAt,
		error: message,
		pendingDraft: text,
		attempt: attempt + 1,
	};
	emit(failedResult);
	if (nextDelay === undefined) {
		// Exhausted the budget. Hold the failed state until the next
		// keystroke or explicit flushNow().
		return;
	}
	attempt += 1;
	retryTimer = setTimeout(() => {
		retryTimer = null;
		void runFlush();
	}, nextDelay);
}
