import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';

export interface ExportChapterOption {
	id: string;
	title: string;
	order: number;
	label: string;
}

interface ExportChapterOptionsDeps {
	getProjectById?: typeof getProjectById;
	getChaptersByProjectId?: typeof getChaptersByProjectId;
}

export class ExportChapterOptionsError extends Error {
	constructor(
		public readonly code: 'missing_project' | 'load_failed',
		message: string,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = 'ExportChapterOptionsError';
	}
}

export function createChapterOptionLabel(
	title: string | null | undefined,
	order: number,
	index: number,
): string {
	const displayOrder = Number.isFinite(order) ? order + 1 : index + 1;
	const safeTitle = title?.trim() || `Untitled chapter ${displayOrder}`;
	return `Chapter ${displayOrder} - ${safeTitle}`;
}

export async function getExportChapterOptions(
	projectId: string,
	deps: ExportChapterOptionsDeps = {},
): Promise<ExportChapterOption[]> {
	const loadProject = deps.getProjectById ?? getProjectById;
	const loadChapters = deps.getChaptersByProjectId ?? getChaptersByProjectId;

	try {
		const project = await loadProject(projectId);
		if (!project) {
			throw new ExportChapterOptionsError('missing_project', `Project not found: ${projectId}`);
		}

		const chapters = await loadChapters(projectId);
		return chapters.map((chapter, index) => {
			const order = chapter.order ?? index;
			const title = chapter.title?.trim() || `Untitled chapter ${order + 1}`;
			return {
				id: chapter.id,
				title,
				order,
				label: createChapterOptionLabel(chapter.title, order, index),
			};
		});
	} catch (error) {
		if (error instanceof ExportChapterOptionsError) {
			throw error;
		}
		throw new ExportChapterOptionsError('load_failed', 'Unable to load chapter list.', error);
	}
}
