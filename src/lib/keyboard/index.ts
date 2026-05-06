/**
 * Public API for the Novellum keymap registry.
 *
 * Import from this barrel in application code and tests.
 */
export type { ActionDef, ActionEntry, SaveResult } from './keymap-registry.js';
export {
	registerAction,
	getBinding,
	listActions,
	loadBindings,
	loadSavedBindings,
	saveBinding,
	resetBinding,
	resetAll,
	hasConflict,
} from './keymap-registry.js';
