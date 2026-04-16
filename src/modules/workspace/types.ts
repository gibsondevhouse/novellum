import type { Beat, Stage } from '$lib/db/types.js';

export type WorkspaceMode = 'arcs' | 'acts' | 'chapters' | 'scenes';

export const WORKSPACE_MODES = ['arcs', 'acts', 'chapters', 'scenes'] as const;

export const WORKSPACE_MODE_LABELS: Record<WorkspaceMode, string> = {
	arcs: 'Arcs',
	acts: 'Acts',
	chapters: 'Chapters',
	scenes: 'Scenes',
};

/** Generic option shape used by status dropdowns, type pickers, etc. */
export interface StatusOption<T extends string = string> {
	value: T;
	label: string;
}

/** Beat with its child stages pre-joined. */
export interface BeatWithStages extends Beat {
	stages: Stage[];
}
