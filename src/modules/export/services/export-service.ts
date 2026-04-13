import { assembleProject } from './assembler.js';
import { buildMarkdown } from './markdown-driver.js';
import type { ExportOptions } from '../types.js';

export async function exportProject(
	projectId: string,
	options: ExportOptions,
): Promise<{ filename: string; blob: Blob }> {
	const assembled = await assembleProject(projectId);
	const safeName = assembled.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

	if (options.format === 'markdown') {
		const text = buildMarkdown(assembled, options);
		const blob = new Blob([text], { type: 'text/markdown' });
		return { filename: `${safeName}.md`, blob };
	}

	if (options.format === 'docx') {
		const { buildDocx } = await import('./docx-driver.js');
		const blob = await buildDocx(assembled, options);
		return { filename: `${safeName}.docx`, blob };
	}

	if (options.format === 'epub') {
		const { buildEpub } = await import('./epub-driver.js');
		const blob = await buildEpub(assembled, options);
		return { filename: `${safeName}.epub`, blob };
	}

	throw new Error(`Format not yet implemented: ${options.format}`);
}
