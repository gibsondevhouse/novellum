import { getProfile } from './manuscript-profiles.js';
import type { AssembledManuscript } from '../types.js';

export function buildMarkdown(manuscript: AssembledManuscript): string {
	const { metadata, profileId } = manuscript;
	const profile = getProfile(profileId);

	const frontMatterLines: string[] = [
		'---',
		`title: ${metadata.title ?? ''}`,
		`author: ${metadata.author || 'Unknown'}`,
	];
	if (metadata.subtitle) frontMatterLines.push(`subtitle: ${metadata.subtitle}`);
	if (metadata.synopsis) frontMatterLines.push(`synopsis: ${metadata.synopsis}`);
	frontMatterLines.push('---', '');

	const frontMatter = frontMatterLines.join('\n');

	if (manuscript.chapters.length === 0) {
		return frontMatter;
	}

	let titleBlock = '';
	if (profile.defaults.includeFrontMatter && metadata.title) {
		titleBlock = `# ${metadata.title}\n\n`;
		if (metadata.author) titleBlock += `*${metadata.author}*\n\n`;
	}

	const chapterBlocks = manuscript.chapters.map((ch) => {
		const heading = `## ${ch.title}`;
		const sceneParts = ch.scenes.map((scene) => {
			if (scene.title) {
				return `### ${scene.title}\n\n${scene.content}`;
			}
			return scene.content;
		});
		return `${heading}\n\n${sceneParts.join('\n\n---\n\n')}`;
	});

	return frontMatter + titleBlock + chapterBlocks.join('\n\n---\n\n');
}
