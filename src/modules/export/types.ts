export type ExportFormat = 'markdown' | 'docx' | 'epub' | 'backup_zip';

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

export type ManuscriptProfileId =
	| 'standard_manuscript'
	| 'reader_copy'
	| 'ebook_draft'
	| 'plain_text_archive';

export interface ManuscriptMetadata {
	title?: string;
	author?: string;
	subtitle?: string;
	synopsis?: string;
	copyright?: string;
	dedication?: string;
}

export interface ManuscriptCompileOptions {
	profileId: ManuscriptProfileId;
	metadata: ManuscriptMetadata;
	selectedChapterIds?: string[];
	includeFrontMatter: boolean;
	includeBackMatter: boolean;
}

export interface AssembledScene {
	id: string;
	title: string;
	content: string;
	wordCount: number;
	order: number;
}

export interface AssembledManuscriptChapter {
	id: string;
	title: string;
	order: number;
	scenes: AssembledScene[];
}

export interface AssembledManuscript {
	projectId: string;
	metadata: ManuscriptMetadata;
	profileId: ManuscriptProfileId;
	chapters: AssembledManuscriptChapter[];
	totalWordCount: number;
	compiledAt: string;
}
