let isPanelOpen: boolean = $state(false);
let currentTaskType: string | null = $state(null);
let lastResponse: string | null = $state(null);
let isStreaming: boolean = $state(false);

export function getIsPanelOpen() { return isPanelOpen; }
export function getCurrentTaskType() { return currentTaskType; }
export function getLastResponse() { return lastResponse; }
export function getIsStreaming() { return isStreaming; }

export function openPanel(taskType?: string): void {
	isPanelOpen = true;
	currentTaskType = taskType ?? null;
}
export function closePanel(): void {
	isPanelOpen = false;
}
export function setResponse(response: string): void {
	lastResponse = response;
}
export function setStreaming(v: boolean): void {
	isStreaming = v;
}

