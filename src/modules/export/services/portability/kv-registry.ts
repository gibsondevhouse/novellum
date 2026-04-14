/**
 * Allowlisted localStorage key prefixes for portability backup.
 * Only keys matching these prefixes are included in snapshots.
 */
export const KV_ALLOWED_PREFIXES = [
	'novellum:planning:',
	'novellum:outliner:',
	'novellum:prefs:',
] as const;

/**
 * Keys explicitly excluded even if they match an allowed prefix.
 */
export const KV_EXCLUDED_KEYS = ['novellum:planning:draft-form'] as const;

/** Check if a localStorage key should be included in a portability snapshot. */
export function isKeyAllowed(key: string): boolean {
	if ((KV_EXCLUDED_KEYS as readonly string[]).includes(key)) return false;
	return (KV_ALLOWED_PREFIXES as readonly string[]).some((prefix) => key.startsWith(prefix));
}
