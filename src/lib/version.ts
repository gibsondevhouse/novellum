/**
 * Canonical app version. Single source of truth — every place that
 * needs to embed the running build's version (manifests, backups,
 * UI footers) MUST import from here.
 *
 * Sourced from `package.json#version` so the npm version, the
 * desktop installer version (synced via `scripts/sync-tauri-version.mjs`),
 * and the runtime constant can never drift.
 */
import pkg from '../../package.json' with { type: 'json' };

export const APP_VERSION: string = pkg.version;

/**
 * Accessor preferred by new call sites. Equivalent to reading
 * {@link APP_VERSION} but reads as an intentional API on the
 * Settings → About surface that plan-018 stage-004 will consume.
 */
export function getAppVersion(): string {
	return APP_VERSION;
}
