import type { AssembledProject, ExportOptions } from '../types.js';

export function buildMarkdown(assembled: AssembledProject, options: ExportOptions): string {
	const frontMatter = [
		'---',
		`title: ${assembled.title}`,
		`genre: ${assembled.genre || 'Unknown'}`,
		'author: Unknown',
		'---',
		'',
	].join('\n');

	if (assembled.chapters.length === 0) {
		return frontMatter;
	}

	const chapterBlocks = assembled.chapters.map((ch) => {
		let heading: string;
		if (options.chapterStyle === 'chapter_number') {
			heading = `# Chapter ${ch.order + 1}`;
		} else if (options.chapterStyle === 'both') {
			heading = `# Chapter ${ch.order + 1}: ${ch.title}`;
		} else {
			heading = `# ${ch.title}`;
		}

		const scenesText = ch.scenes.join('\n\n---\n\n');
		return `${heading}\n\n${scenesText}`;
	});

	return frontMatter + chapterBlocks.join('\n\n---\n\n');
}
