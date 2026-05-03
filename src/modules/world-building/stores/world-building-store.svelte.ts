let activeProjectId: string | null = $state(null);
let selectedTab: 'characters' | 'locations' | 'lore' | 'plot-threads' | 'timeline' =
	$state('characters');
let selectedEntityId: string | null = $state(null);
let isLoading: boolean = $state(false);

const hasSelection = $derived(selectedEntityId !== null);

export function setSelectedTab(tab: typeof selectedTab): void {
	selectedTab = tab;
}
export function setSelectedEntity(id: string | null): void {
	selectedEntityId = id;
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
export function getSelectedTab() {
	return selectedTab;
}
export function getSelectedEntityId() {
	return selectedEntityId;
}
export function getIsLoading() {
	return isLoading;
}
export function getHasSelection() {
	return hasSelection;
}
