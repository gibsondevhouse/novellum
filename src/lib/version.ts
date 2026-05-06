/**
 * Canonical app version. Single source of truth — every place that
 * needs to embed the running build's version (manifests, backups,
 * UI footers) MUST import from here.
 *
 * APP_VERSION is injected at build time by Vite via the define block in
 * vite.config.ts. The fallback '0.0.0-dev' is a safety net for test
 * environments where the define block is not applied.
 */

export const APP_VERSION: string =
	// PACKAGE_VERSION is replaced at build time by the vite.config.ts define block.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	((import.meta.env as any).PACKAGE_VERSION as string | undefined) ?? '0.0.0-dev';

/**
 * Accessor preferred by new call sites. Equivalent to reading
 * {@link APP_VERSION} but reads as an intentional API on the
 * Settings → About surface that plan-018 stage-004 will consume.
 */
export function getAppVersion(): string {
	return APP_VERSION;
}
