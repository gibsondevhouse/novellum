import { SvelteSet } from 'svelte/reactivity';

let activeProjectId: string | null = $state(null);
let selectedBeatId: string | null = $state(null);
const expandedChapterIds: SvelteSet<string> = new SvelteSet();
let isLoading: boolean = $state(false);

const hasSelection = $derived(selectedBeatId !== null);

export function setSelectedBeat(id: string | null): void {
	selectedBeatId = id;
}
export function toggleChapter(chapterId: string): void {
	if (expandedChapterIds.has(chapterId)) {
		expandedChapterIds.delete(chapterId);
	} else {
		expandedChapterIds.add(chapterId);
	}
}
export function setActiveProject(projectId: string | null): void {
	activeProjectId = projectId;
}
export function setLoading(v: boolean): void {
	isLoading = v;
}

export function getActiveProjectId() {
	return activeProjectId;
}
export function getSelectedBeatId() {
	return selectedBeatId;
}
export function getExpandedChapterIds() {
	return expandedChapterIds;
}
export function getIsLoading() {
	return isLoading;
}
export function getHasSelection() {
	return hasSelection;
}
