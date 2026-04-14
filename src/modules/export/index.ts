export { exportProject } from './services/export-service.js';
export { default as ExportModal } from './components/ExportModal.svelte';
export { getExportSettings, updateExportSettings } from './services/export-settings-repository.js';
export type { ExportFormat, ExportOptions, AssembledProject, AssembledChapter } from './types.js';

// Portability
export {
	validateManifestShape,
	checkManifestCompatibility,
	getCompatibilityMessage,
} from './services/portability/manifest-policy.js';
export type {
	PortabilityManifest,
	BackupPayloadIndex,
	CompatibilityResult,
	PortabilityErrorCode,
} from './services/portability/types.js';
export {
	buildDexieSnapshot,
	buildKeyValueSnapshot,
	buildPortabilitySnapshot,
} from './services/portability/snapshot-service.js';
export type {
	DexieSnapshot,
	KeyValueSnapshot,
	PortabilitySnapshot,
} from './services/portability/snapshot-service.js';
export { isKeyAllowed, KV_ALLOWED_PREFIXES } from './services/portability/kv-registry.js';
export { buildBackupArchive, createBackupFilename } from './services/portability/zip-export.js';
export {
	parseBackupArchive,
	buildPreviewSummary,
	PortabilityParseError,
} from './services/portability/zip-import-parse.js';
export type { ParsedArchive, PreviewSummary } from './services/portability/zip-import-parse.js';
export { restoreBackupSnapshot } from './services/portability/restore-service.js';
export type { RestoreResult } from './services/portability/restore-service.js';
export { default as ImportBackupDialog } from './components/ImportBackupDialog.svelte';
