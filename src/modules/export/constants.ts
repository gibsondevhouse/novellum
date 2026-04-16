import type { ExportFormat } from './types.js';

export const EXPORT_FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'docx', label: 'DOCX' },
	{ value: 'epub', label: 'EPUB' },
	{ value: 'backup_zip', label: 'Backup ZIP' },
];

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
	markdown: '.md',
	docx: '.docx',
	epub: '.epub',
	backup_zip: '.novellum.zip',
};

export const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
	markdown: 'text/markdown',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	epub: 'application/epub+zip',
	backup_zip: 'application/zip',
};

export const FONT_FAMILY_OPTIONS = [
	{ value: 'Georgia', label: 'Georgia' },
	{ value: 'Times New Roman', label: 'Times New Roman' },
	{ value: 'Arial', label: 'Arial' },
	{ value: 'Courier New', label: 'Courier New' },
] as const;

export const LINE_SPACING_OPTIONS = [
	{ value: 1, label: '1.0' },
	{ value: 1.15, label: '1.15' },
	{ value: 1.5, label: '1.5' },
	{ value: 2, label: '2.0' },
] as const;

export const CHAPTER_STYLE_OPTIONS = [
	{ value: 'heading', label: 'Heading text' },
	{ value: 'chapter_number', label: 'Chapter number' },
	{ value: 'both', label: 'Both' },
] as const;

export const DEFAULT_EXPORT_SETTINGS = {
	titlePage: true,
	chapterStyle: 'heading' as const,
	fontFamily: 'Georgia',
	fontSize: 12,
	lineSpacing: 1.5,
} as const;
