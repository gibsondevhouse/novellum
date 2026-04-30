/**
 * Tauri-backed implementation of the desktop capabilities surface.
 *
 * This module is loaded lazily by `src/lib/desktop/index.ts` only when
 * the runtime detects the Tauri shell, so the web bundle does not
 * import `@tauri-apps/api`.
 *
 * Phases 003–005 will replace these placeholders with real plugin
 * calls (`@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-shell`,
 * `@tauri-apps/plugin-keyring`). The placeholders raise a controlled
 * error so any caller that reaches them today fails loudly rather
 * than silently no-op'ing.
 */

import type { DesktopCapabilities } from './index.js';

function notYetImplemented(name: string): never {
	throw new Error(
		`desktop.${name} is not implemented yet. Phases 003-005 of stage-008 wire the Tauri plugins.`,
	);
}

export const tauriCapabilities: DesktopCapabilities = {
	async openDataFolder() {
		notYetImplemented('openDataFolder');
	},
	async revealItemInFolder() {
		notYetImplemented('revealItemInFolder');
	},
	async pickSaveLocation() {
		notYetImplemented('pickSaveLocation');
	},
	async pickOpenLocation() {
		notYetImplemented('pickOpenLocation');
	},
};
