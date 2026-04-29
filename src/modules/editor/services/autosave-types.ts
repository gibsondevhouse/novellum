/**
 * Public shape emitted by `autosave-service` to its single subscriber.
 *
 * Kept as data-only so it can be consumed by Svelte components, tests,
 * and the future recovery service without dragging the service module
 * itself into the import graph.
 */

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export interface AutosaveResult {
	/** Current status; transitions are emitted in order. */
	status: AutosaveStatus;
	/** ISO timestamp of the most recent successful save, or null. */
	savedAt: string | null;
	/**
	 * Sanitised error message when `status === 'failed'`. Stack traces
	 * and environment values are stripped before they reach the
	 * subscriber.
	 */
	error: string | null;
	/**
	 * The text that could not be flushed; retained across retries so
	 * the recovery service has something to recover from after a
	 * crash.
	 */
	pendingDraft: string | null;
	/** 0 when not retrying, ≥1 while retry attempts are scheduled. */
	attempt: number;
}

export type AutosaveSubscriber = (result: AutosaveResult) => void;

/**
 * Bounded retry schedule (ms). The service stops scheduling further
 * retries once this list is exhausted; the next user keystroke
 * re-arms the loop.
 */
export const AUTOSAVE_RETRY_DELAYS_MS: readonly number[] = [500, 1500, 4500];

export const AUTOSAVE_DEBOUNCE_MS = 2000;
