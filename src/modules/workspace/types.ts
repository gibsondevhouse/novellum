export type WorkspaceMode = 'arcs' | 'acts' | 'chapters' | 'scenes';

export const WORKSPACE_MODES = ['arcs', 'acts', 'chapters', 'scenes'] as const;

export const WORKSPACE_MODE_LABELS: Record<WorkspaceMode, string> = {
	arcs: 'Arcs',
	acts: 'Acts',
	chapters: 'Chapters',
	scenes: 'Scenes',
};
