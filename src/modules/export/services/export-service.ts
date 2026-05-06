import { getProjectById } from '$modules/project/services/project-repository.js';
import { assembleManuscript } from './manuscript-assembler.js';
import { buildMarkdown } from './markdown-driver.js';
import type { ExportOptions, ManuscriptCompileOptions } from '../types.js';

export async function exportProject(
	projectId: string,
	options: ExportOptions,
): Promise<{ filename: string; blob: Blob }> {
	const project = await getProjectById(projectId);
	const compileOptions: ManuscriptCompileOptions = {
		profileId: 'reader_copy',
		metadata: {
			title: project?.title ?? '',
			author: '',
		},
		includeFrontMatter: options.titlePage,
		includeBackMatter: false,
	};

	const manuscript = await assembleManuscript(projectId, compileOptions);
	const safeName = (manuscript.metadata.title ?? projectId)
		.replace(/[^a-z0-9]/gi, '_')
		.toLowerCase() || 'project';

	if (options.format === 'markdown') {
		const text = buildMarkdown(manuscript);
		const blob = new Blob([text], { type: 'text/markdown' });
		return { filename: `${safeName}.md`, blob };
	}

	if (options.format === 'docx') {
		const { buildDocx } = await import('./docx-driver.js');
		const blob = await buildDocx(manuscript);
		return { filename: `${safeName}.docx`, blob };
	}

	if (options.format === 'epub') {
		const { buildEpub } = await import('./epub-driver.js');
		const blob = await buildEpub(manuscript);
		return { filename: `${safeName}.epub`, blob };
	}

	if (options.format === 'backup_zip') {
		const { buildBackupArchive, createBackupFilename } =
			await import('./portability/zip-export.js');
		const { blob, manifest } = await buildBackupArchive(projectId);
		const filename = createBackupFilename(manuscript.metadata.title ?? projectId, manifest.exportedAt);
		return { filename, blob };
	}

	throw new Error(`Format not yet implemented: ${options.format}`);
}
