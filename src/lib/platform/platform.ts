/**
 * Runtime platform detector.
 *
 * Three modes:
 *   - 'desktop' : running inside the Tauri shell (window.__TAURI_INTERNALS__).
 *   - 'dev'     : running in a SvelteKit dev server outside of Tauri.
 *   - 'web'     : running in a normal browser against a deployed build.
 *
 * The detector is intentionally tiny and side-effect-free so it can be
 * imported from any module — including SSR contexts, where `window`
 * is undefined and the platform is always 'web'.
 */

export type Platform = 'web' | 'dev' | 'desktop';

interface TauriWindow {
	__TAURI_INTERNALS__?: unknown;
	__TAURI__?: unknown;
}

export function getPlatform(): Platform {
	if (typeof window === 'undefined') return 'web';
	const w = window as TauriWindow;
	if (w.__TAURI_INTERNALS__ || w.__TAURI__) return 'desktop';
	if (import.meta.env?.DEV) return 'dev';
	return 'web';
}

export function isDesktop(): boolean {
	return getPlatform() === 'desktop';
}

export function isWeb(): boolean {
	return getPlatform() === 'web';
}
