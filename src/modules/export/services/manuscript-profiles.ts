import type { ManuscriptProfileId, ManuscriptCompileOptions } from '../types.js';

export interface ManuscriptProfile {
	id: ManuscriptProfileId;
	label: string;
	description: string;
	defaults: Pick<ManuscriptCompileOptions, 'includeFrontMatter' | 'includeBackMatter'>;
}

export const MANUSCRIPT_PROFILES: Record<ManuscriptProfileId, ManuscriptProfile> = {
	standard_manuscript: {
		id: 'standard_manuscript',
		label: 'Standard Manuscript',
		description: 'Formatted for submission — title page, double-spaced, page numbers.',
		defaults: { includeFrontMatter: true, includeBackMatter: false },
	},
	reader_copy: {
		id: 'reader_copy',
		label: 'Reader Copy',
		description: 'Clean reading copy without submission formatting.',
		defaults: { includeFrontMatter: true, includeBackMatter: true },
	},
	ebook_draft: {
		id: 'ebook_draft',
		label: 'Ebook Draft',
		description: 'EPUB-optimized with metadata and TOC.',
		defaults: { includeFrontMatter: true, includeBackMatter: true },
	},
	plain_text_archive: {
		id: 'plain_text_archive',
		label: 'Plain Text Archive',
		description: 'Minimal Markdown with no formatting, suitable for archival.',
		defaults: { includeFrontMatter: false, includeBackMatter: false },
	},
};

export function getProfile(id: ManuscriptProfileId): ManuscriptProfile {
	return MANUSCRIPT_PROFILES[id];
}
