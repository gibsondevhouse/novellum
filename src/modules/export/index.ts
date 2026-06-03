export { exportProject } from './services/export-service.js';
export { default as ExportModal } from './components/ExportModal.svelte';
export { default as ManuscriptExportDialog } from './components/ManuscriptExportDialog.svelte';
export { getExportSettings, updateExportSettings } from './services/export-settings-repository.js';
export type {
	ExportFormat,
	ExportOptions,
	ExportDeliveryPreference,
	AssembledProject,
	AssembledChapter,
	ManuscriptProfileId,
	ManuscriptMetadata,
	ManuscriptCompileOptions,
	ManuscriptExportRequest,
	AssembledScene,
	AssembledManuscriptChapter,
	AssembledManuscript,
} from './types.js';
export {
	ExportServiceError,
	createExportFilename,
	normalizeManuscriptMetadata,
} from './services/export-service.js';
export { assembleManuscript } from './services/manuscript-assembler.js';
export { MANUSCRIPT_PROFILES, getProfile } from './services/manuscript-profiles.js';
export type { ManuscriptProfile } from './services/manuscript-profiles.js';
export {
	EXPORT_FORMAT_OPTIONS,
	FORMAT_EXTENSIONS,
	FORMAT_MIME_TYPES,
	FONT_FAMILY_OPTIONS,
	LINE_SPACING_OPTIONS,
	CHAPTER_STYLE_OPTIONS,
	DEFAULT_EXPORT_SETTINGS,
} from './constants.js';
export {
	downloadBlobToBrowser,
	deliverExportBlob,
	ExportDeliveryError,
} from './services/export-delivery.js';
export type {
	ExportDeliveryMethod,
	ExportDeliveryOptions,
	ExportDeliveryResult,
	ExportDeliveryStatus,
} from './services/export-delivery.js';
export {
	getExportChapterOptions,
	createChapterOptionLabel,
	ExportChapterOptionsError,
} from './services/export-chapter-options.js';
export type { ExportChapterOption } from './services/export-chapter-options.js';

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
