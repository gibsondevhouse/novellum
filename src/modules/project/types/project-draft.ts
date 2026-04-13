export type ProjectDraft = {
	title: string;
	genre: string[];
	logline: string;
	synopsis: string;
	targetWordCount: number | null;
};

export function emptyDraft(): ProjectDraft {
	return {
		title: '',
		genre: [],
		logline: '',
		synopsis: '',
		targetWordCount: null,
	};
}
