import { getProjectById } from '$modules/project/services/project-repository.js';
import { assembleManuscript } from './manuscript-assembler.js';
import { buildMarkdown } from './markdown-driver.js';
import { FORMAT_EXTENSIONS } from '../constants.js';
import type {
	ExportFormat,
	ExportOptions,
	ManuscriptCompileOptions,
	ManuscriptExportRequest,
	ManuscriptMetadata,
} from '../types.js';

export class ExportServiceError extends Error {
	constructor(
		public readonly code:
			| 'missing_project'
			| 'unsupported_format'
			| 'invalid_chapter_selection'
			| 'driver_failure',
		message: string,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = 'ExportServiceError';
	}
}

function sanitizeFilenameStem(input: string): string {
	return (
		input
			.trim()
			.replace(/[^a-z0-9\s-]/gi, '')
			.replace(/\s+/g, '_')
			.toLowerCase()
			.slice(0, 80) || 'untitled_manuscript'
	);
}

export function createExportFilename(title: string | undefined, format: ExportFormat): string {
	const stem = sanitizeFilenameStem(title ?? 'Untitled Manuscript');
	return `${stem}${FORMAT_EXTENSIONS[format]}`;
}

export function normalizeManuscriptMetadata(
	metadata: ManuscriptMetadata,
	fallbackTitle = 'Untitled Manuscript',
): ManuscriptMetadata {
	const normalized: ManuscriptMetadata = {};
	const title = metadata.title?.trim() || fallbackTitle;
	normalized.title = title.trim() || 'Untitled Manuscript';

	for (const key of ['author', 'subtitle', 'synopsis', 'copyright', 'dedication'] as const) {
		const value = metadata[key]?.trim();
		if (value) {
			normalized[key] = value;
		}
	}

	return normalized;
}

function isManuscriptExportRequest(
	input: ExportOptions | ManuscriptExportRequest,
): input is ManuscriptExportRequest {
	return 'exportOptions' in input && 'compileOptions' in input;
}

function buildLegacyRequest(options: ExportOptions, title: string): ManuscriptExportRequest {
	return {
		exportOptions: options,
		compileOptions: {
			profileId: 'reader_copy',
			metadata: normalizeManuscriptMetadata({ title, author: '' }, title),
			includeFrontMatter: options.titlePage,
			includeBackMatter: false,
		},
		deliveryPreference: 'browser_download',
	};
}

function normalizeRequest(
	input: ExportOptions | ManuscriptExportRequest,
	projectTitle: string,
): ManuscriptExportRequest {
	const request = isManuscriptExportRequest(input)
		? input
		: buildLegacyRequest(input, projectTitle);

	const selectedChapterIds = request.compileOptions.selectedChapterIds;
	if (selectedChapterIds && selectedChapterIds.length === 0) {
		throw new ExportServiceError(
			'invalid_chapter_selection',
			'Selected chapter list cannot be empty.',
		);
	}

	return {
		...request,
		compileOptions: {
			...request.compileOptions,
			metadata: normalizeManuscriptMetadata(request.compileOptions.metadata, projectTitle),
			selectedChapterIds,
		},
	};
}

export async function exportProject(
	projectId: string,
	options: ExportOptions | ManuscriptExportRequest,
): Promise<{ filename: string; blob: Blob }> {
	const project = await getProjectById(projectId);
	if (!project) {
		throw new ExportServiceError('missing_project', `Project not found: ${projectId}`);
	}

	const request = normalizeRequest(options, project.title ?? 'Untitled Manuscript');
	const { exportOptions } = request;

	if (!Object.prototype.hasOwnProperty.call(FORMAT_EXTENSIONS, exportOptions.format)) {
		throw new ExportServiceError(
			'unsupported_format',
			`Format not implemented: ${exportOptions.format}`,
		);
	}

	if (exportOptions.format === 'backup_zip') {
		try {
			const { buildBackupArchive, createBackupFilename } =
				await import('./portability/zip-export.js');
			const { blob, manifest } = await buildBackupArchive(projectId);
			const filename = createBackupFilename(
				request.compileOptions.metadata.title ?? project.title ?? projectId,
				manifest.exportedAt,
			);
			return { filename, blob };
		} catch (error) {
			throw new ExportServiceError('driver_failure', 'Backup export failed.', error);
		}
	}

	let manuscript;
	try {
		manuscript = await assembleManuscript(
			projectId,
			request.compileOptions as ManuscriptCompileOptions,
		);
	} catch (error) {
		if (error instanceof ExportServiceError) throw error;
		throw new ExportServiceError('driver_failure', 'Manuscript assembly failed.', error);
	}

	const filename = createExportFilename(manuscript.metadata.title, exportOptions.format);

	try {
		if (exportOptions.format === 'markdown') {
			const text = buildMarkdown(manuscript);
			const blob = new Blob([text], { type: 'text/markdown' });
			return { filename, blob };
		}

		if (exportOptions.format === 'docx') {
			const { buildDocx } = await import('./docx-driver.js');
			const blob = await buildDocx(manuscript);
			return { filename, blob };
		}

		if (exportOptions.format === 'epub') {
			const { buildEpub } = await import('./epub-driver.js');
			const blob = await buildEpub(manuscript);
			return { filename, blob };
		}
	} catch (error) {
		throw new ExportServiceError('driver_failure', 'Export driver failed.', error);
	}

	throw new ExportServiceError(
		'unsupported_format',
		`Format not implemented: ${exportOptions.format}`,
	);
}
