let activeProjectId: string | null = $state(null);
let activeProjectName: string | null = $state(null);

export function getActiveProjectId() {
	return activeProjectId;
}
export function getActiveProjectName() {
	return activeProjectName;
}

export function setActiveProject(id: string, name: string): void {
	activeProjectId = id;
	activeProjectName = name;
}
export function clearActiveProject(): void {
	activeProjectId = null;
	activeProjectName = null;
}
