/**
 * Desktop abstraction surface.
 *
 * Re-exports a stable, frontend-friendly API for OS capabilities the
 * editor route may need (file dialogs, open-data-folder, OS keyring).
 * Implementations no-op on web so callers do not need to gate every
 * call behind `isDesktop()`.
 *
 * Phase 002 ships only the platform detector and the no-op surface.
 * Phases 003–005 wire each capability to its Tauri plugin counterpart.
 */

import { isDesktop } from '../platform/platform.js';

export interface DesktopCapabilities {
	openDataFolder(): Promise<void>;
	revealItemInFolder(path: string): Promise<void>;
	pickSaveLocation(suggestedName: string): Promise<string | null>;
	pickOpenLocation(): Promise<string | null>;
}

const webStub: DesktopCapabilities = {
	async openDataFolder() {
		// no-op on web — there is no local data folder
	},
	async revealItemInFolder() {
		// no-op on web
	},
	async pickSaveLocation() {
		return null;
	},
	async pickOpenLocation() {
		return null;
	},
};

let cached: DesktopCapabilities | null = null;

/**
 * Returns the desktop capabilities surface. On web the stub is used;
 * on desktop the Tauri plugins are loaded lazily so web bundles never
 * pay the cost of importing `@tauri-apps/api`.
 */
export async function getDesktop(): Promise<DesktopCapabilities> {
	if (cached) return cached;
	if (!isDesktop()) {
		cached = webStub;
		return cached;
	}
	// Lazy import of the Tauri-bound implementation.
	const mod = await import('./tauri-impl.js');
	cached = mod.tauriCapabilities;
	return cached;
}

export { isDesktop } from '../platform/platform.js';
