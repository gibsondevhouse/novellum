/**
 * Runtime selector that picks the right {@link SecureStore} backend
 * based on the runtime environment.
 *
 * - Desktop (Tauri sidecar): OS keyring via {@link createKeyringSecureStore}.
 *   The Tauri Rust shell sets `NOVELLUM_DESKTOP=1` when spawning the
 *   Node sidecar (see `src-tauri/src/sidecar.rs`).
 * - Everywhere else (dev / test / hosted server): filesystem store at
 *   `${appDataDir}/credentials.json` with 0600 perms.
 *
 * This module is the single public selector used by route handlers;
 * keeping the branching here means callers never need to know which
 * backend is active.
 */

import { createFileSystemSecureStore, type SecureStore } from './secure-store.js';
import { createKeyringSecureStore } from './keyring-store.js';

export interface SelectSecureStoreOptions {
	/** Override the desktop detection (tests). */
	desktop?: boolean;
	/** Forward to the filesystem backend. */
	appDataDir?: string;
	/** Forward to the keyring backend. */
	serviceName?: string;
}

export function isDesktopRuntime(): boolean {
	return typeof process !== 'undefined' && process.env?.NOVELLUM_DESKTOP === '1';
}

export function selectSecureStore(options: SelectSecureStoreOptions = {}): SecureStore {
	const desktop = options.desktop ?? isDesktopRuntime();
	if (desktop) {
		return createKeyringSecureStore({ serviceName: options.serviceName });
	}
	return createFileSystemSecureStore({ appDataDir: options.appDataDir });
}
