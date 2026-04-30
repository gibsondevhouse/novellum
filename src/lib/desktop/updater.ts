/**
 * Auto-updater stub.
 *
 * Phase-006 of plan-017 stage-008: ship the *surface area* an
 * Settings → About panel needs to call without committing to a
 * release-distribution channel yet. The real auto-updater (signed
 * artifacts, GitHub Releases feed, signature verification) lands in
 * plan-018 stage-010.
 *
 * On web this module is inert: `checkForUpdates()` resolves to a
 * `none` result. On desktop it currently returns `unsupported` so
 * the UI can render a graceful "auto-updates ship in 1.x" message.
 * When plan-018 wires `tauri-plugin-updater`, the desktop branch
 * will switch to a real check via `await import(...)`.
 */

import { isDesktop } from '$lib/platform/platform.js';
import { getAppVersion } from '$lib/version.js';

export type UpdateStatus =
	| { kind: 'none'; currentVersion: string }
	| { kind: 'unsupported'; currentVersion: string; reason: string }
	| { kind: 'available'; currentVersion: string; nextVersion: string; notes?: string };

export async function checkForUpdates(): Promise<UpdateStatus> {
	const currentVersion = getAppVersion();
	if (!isDesktop()) {
		return { kind: 'none', currentVersion };
	}
	// TODO(plan-018 stage-010): replace with a real call to
	// `@tauri-apps/plugin-updater`'s `check()`. For now expose the
	// shape so Settings → About can bind without rework.
	return {
		kind: 'unsupported',
		currentVersion,
		reason: 'Auto-updates are scheduled for the next release cycle.',
	};
}

export async function applyUpdate(): Promise<void> {
	if (!isDesktop()) {
		throw new Error('applyUpdate is desktop-only');
	}
	throw new Error('applyUpdate is not implemented yet (plan-018 stage-010).');
}
