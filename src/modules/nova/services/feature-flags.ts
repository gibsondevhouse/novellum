/**
 * plan-023 stage-006 phase-003 — Module-local feature flag.
 *
 * Single experimental flag: `experimental.nova.agentic`. Reads from
 * `import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC` (truthy values:
 * `1`, `true`, `on`, `yes`; case-insensitive). Default: off.
 *
 * In-memory override via `setNovaAgenticFlag` is reserved for tests;
 * pass `null` to clear the override. A global `$lib/feature-flags`
 * system can replace this later — keep the API surface minimal.
 */

let override: boolean | null = null;

function readEnvFlag(): boolean {
	// Access `import.meta.env` directly (without intermediate destructure)
	// so Vite's proxy resolves at runtime — destructured access yields a
	// snapshotted object missing arbitrary keys, breaking `vi.stubEnv`.
	const meta = import.meta as ImportMeta & { env?: Record<string, unknown> };
	if (!meta.env) return false;
	const raw = import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC;
	if (typeof raw !== 'string') return false;
	return /^(1|true|on|yes)$/i.test(raw.trim());
}

export function isNovaAgenticEnabled(): boolean {
	return override ?? readEnvFlag();
}

/** Test-only override. Pass `null` to clear. */
export function setNovaAgenticFlag(value: boolean | null): void {
	override = value;
}
