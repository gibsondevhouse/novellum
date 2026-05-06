import {
	AlignmentType,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	TextRun,
	ThematicBreak,
} from 'docx';
import { getProfile } from './manuscript-profiles.js';
import type { AssembledManuscript } from '../types.js';

export async function buildDocx(manuscript: AssembledManuscript): Promise<Blob> {
	const { metadata } = manuscript;
	const profile = getProfile(manuscript.profileId);
	const sections: Paragraph[] = [];

	if (profile.defaults.includeFrontMatter) {
		sections.push(
			new Paragraph({
				children: [new TextRun({ text: metadata.title ?? '', size: 48, bold: true })],
				heading: HeadingLevel.TITLE,
				alignment: AlignmentType.CENTER,
			}),
		);
		if (metadata.author) {
			sections.push(
				new Paragraph({
					children: [new TextRun({ text: metadata.author })],
					alignment: AlignmentType.CENTER,
				}),
			);
		}
		if (metadata.copyright) {
			sections.push(
				new Paragraph({
					children: [new TextRun({ text: metadata.copyright })],
				}),
			);
		}
		sections.push(new Paragraph({ pageBreakBefore: true }));
	}

	for (const ch of manuscript.chapters) {
		sections.push(new Paragraph({ text: ch.title, heading: HeadingLevel.HEADING_1 }));

		for (let i = 0; i < ch.scenes.length; i++) {
			const scene = ch.scenes[i];

			if (scene.title) {
				sections.push(new Paragraph({ text: scene.title, heading: HeadingLevel.HEADING_2 }));
			}

			const paragraphLines = scene.content.split('\n').filter(Boolean);
			for (const line of paragraphLines) {
				sections.push(
					new Paragraph({
						children: [new TextRun({ text: line })],
					}),
				);
			}

			if (i < ch.scenes.length - 1) {
				sections.push(new Paragraph({ children: [new ThematicBreak()] }));
			}
		}
	}

	const doc = new Document({ sections: [{ children: sections }] });
	const buffer = await Packer.toBuffer(doc);
	const arrayBuffer = buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	) as ArrayBuffer;
	return new Blob([arrayBuffer], {
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	});
}
