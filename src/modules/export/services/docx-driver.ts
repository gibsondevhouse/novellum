import {
	AlignmentType,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	TextRun,
	ThematicBreak,
} from 'docx';
import type { AssembledProject, ExportOptions } from '../types.js';

export async function buildDocx(
	assembled: AssembledProject,
	options: ExportOptions,
): Promise<Blob> {
	const sections: Paragraph[] = [];

	if (options.titlePage) {
		sections.push(
			new Paragraph({
				children: [new TextRun({ text: assembled.title, size: 48, bold: true })],
				alignment: AlignmentType.CENTER,
			}),
			new Paragraph({
				children: [new TextRun({ text: assembled.genre || 'Unknown', size: 24 })],
				alignment: AlignmentType.CENTER,
			}),
			new Paragraph({ pageBreakBefore: true }),
		);
	}

	for (const ch of assembled.chapters) {
		let headingText: string;
		if (options.chapterStyle === 'chapter_number') {
			headingText = `Chapter ${ch.order + 1}`;
		} else if (options.chapterStyle === 'both') {
			headingText = `Chapter ${ch.order + 1}: ${ch.title}`;
		} else {
			headingText = ch.title;
		}

		sections.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_1 }));

		for (let i = 0; i < ch.scenes.length; i++) {
			const paragraphLines = ch.scenes[i].split('\n').filter(Boolean);
			for (const line of paragraphLines) {
				sections.push(
					new Paragraph({
						children: [
							new TextRun({
								text: line,
								font: options.fontFamily,
								size: options.fontSize * 2, // docx uses half-points
							}),
						],
						spacing: { line: Math.round(options.lineSpacing * 240) },
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
