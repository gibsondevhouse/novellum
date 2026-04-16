import type { RetryConfig } from './types.js';

/**
 * Executes an async function with retry logic and exponential backoff.
 *
 * Errors with a numeric `status` property are classified:
 * - 429 or >= 500: retryable
 * - Other 4xx: non-retryable (thrown immediately)
 * - No status (network errors): retryable
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	config: RetryConfig,
): Promise<T> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err: unknown) {
			lastError = err instanceof Error ? err : new Error(String(err));

			const status = (err as Record<string, unknown>).status;
			if (typeof status === 'number') {
				const retryable = status === 429 || status >= 500;
				if (!retryable) {
					throw err;
				}
			}

			if (attempt < config.maxRetries) {
				const delay = config.baseDelayMs * Math.pow(2, attempt - 1);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw new Error(
		`All ${config.maxRetries} retry attempts failed. Last error: ${lastError?.message}`,
		{ cause: lastError },
	);
}
