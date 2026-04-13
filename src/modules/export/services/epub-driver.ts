import epub from 'epub-gen-memory/bundle';
import type { Options, Chapter } from 'epub-gen-memory';
import type { AssembledProject, ExportOptions } from '../types.js';

export async function buildEpub(
	assembled: AssembledProject,
	options: ExportOptions,
): Promise<Blob> {
	const css = `body { font-family: ${options.fontFamily}, serif; font-size: ${options.fontSize}pt; line-height: ${options.lineSpacing}; } p { margin: 0 0 1em; } hr { border: none; border-top: 1px solid #ccc; margin: 1.5em auto; }`;

	const chapters: Chapter[] = assembled.chapters.map((ch) => {
		let title: string;
		if (options.chapterStyle === 'chapter_number') {
			title = `Chapter ${ch.order + 1}`;
		} else if (options.chapterStyle === 'both') {
			title = `Chapter ${ch.order + 1}: ${ch.title}`;
		} else {
			title = ch.title;
		}

		const sceneHtml = ch.scenes
			.map((scene) =>
				scene
					.split('\n')
					.filter(Boolean)
					.map((p) => `<p>${p}</p>`)
					.join(''),
			)
			.join('<hr />');

		return { title, content: sceneHtml };
	});

	const epubOptions: Options = {
		title: assembled.title,
		author: 'Unknown',
		description: assembled.genre || '',
		css,
	};

	if (options.titlePage) {
		const coverChapter: Chapter = {
			title: assembled.title,
			content: `<div style="text-align:center;padding-top:4em;"><h1>${assembled.title}</h1><p>${assembled.genre || ''}</p></div>`,
			beforeToc: true,
			excludeFromToc: true,
		};
		return epub(epubOptions, [coverChapter, ...chapters]);
	}

	return epub(epubOptions, chapters);
}
