/**
 * plan-023 stage-004 phase-004 — Stream controller helper.
 *
 * Thin wrapper around `AbortController` so the message store can hand
 * a `signal` to stage-005's OpenRouter fetch without the store owning
 * the controller plumbing directly. Idempotent abort.
 */

export interface StreamController {
	signal: AbortSignal;
	abort(): void;
}

export function createStreamController(): StreamController {
	const controller = new AbortController();
	return {
		signal: controller.signal,
		abort: () => {
			if (!controller.signal.aborted) {
				controller.abort();
			}
		},
	};
}
