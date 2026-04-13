export type ExportFormat = 'markdown' | 'docx' | 'epub';

export interface ExportOptions {
	format: ExportFormat;
	titlePage: boolean;
	chapterStyle: 'heading' | 'chapter_number' | 'both';
	fontFamily: string;
	fontSize: number;
	lineSpacing: number;
}

export interface AssembledChapter {
	title: string;
	order: number;
	scenes: string[]; // scene.content strings in order
}

export interface AssembledProject {
	id: string;
	title: string;
	genre: string;
	chapters: AssembledChapter[];
}
