import epub from 'epub-gen-memory/bundle';
import type { Options, Chapter } from 'epub-gen-memory';
import { getProfile } from './manuscript-profiles.js';
import type { AssembledManuscript } from '../types.js';

function htmlEscape(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export async function buildEpub(manuscript: AssembledManuscript): Promise<Blob> {
	const { metadata } = manuscript;
	const profile = getProfile(manuscript.profileId);

	const chapters: Chapter[] = manuscript.chapters.map((ch) => {
		const sceneHtml = ch.scenes
			.map((scene) =>
				htmlEscape(scene.content)
					.split('\n')
					.filter(Boolean)
					.map((p) => `<p>${p}</p>`)
					.join(''),
			)
			.join('<hr />');

		return { title: ch.title, content: sceneHtml };
	});

	const epubOptions: Options = {
		title: metadata.title ?? '',
		author: metadata.author || 'Unknown',
		description: metadata.synopsis ?? '',
		css: 'body { font-size: 1em; line-height: 1.6; } p { margin: 0 0 1em; } hr { border: none; border-top: 1px solid #ccc; margin: 1.5em auto; }',
	};

	if (profile.defaults.includeFrontMatter) {
		const coverChapter: Chapter = {
			title: metadata.title ?? '',
			content: `<div style="text-align:center;padding-top:4em;"><h1>${htmlEscape(metadata.title ?? '')}</h1>${metadata.author ? `<p>${htmlEscape(metadata.author)}</p>` : ''}</div>`,
			beforeToc: true,
			excludeFromToc: true,
		};
		return epub(epubOptions, [coverChapter, ...chapters]);
	}

	return epub(epubOptions, chapters);
}
