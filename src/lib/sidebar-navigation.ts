import type { CachedIdResolution } from '$lib/navigation-state.js';

export interface ProjectSidebarActiveState {
	hub: boolean;
	editor: boolean;
	outline: boolean;
	worldbuilding: boolean;
	aiAssistant: boolean;
}

export interface ReaderSidebarEntryState {
	href: string | undefined;
	locked: boolean;
}

export function resolveProjectSidebarActiveState(
	basePath: string,
	pathname: string,
	searchParams: URLSearchParams,
): ProjectSidebarActiveState {
	const editorPath = `${basePath}/editor`;
	const aiPanel = searchParams.get('panel') === 'ai';
	const isEditorPath = pathname === editorPath;

	return {
		hub: pathname === basePath,
		editor: isEditorPath && !aiPanel,
		outline: pathname === `${basePath}/outline`,
		worldbuilding:
			pathname === `${basePath}/world-building` ||
			pathname.startsWith(`${basePath}/world-building/`),
		aiAssistant: isEditorPath && aiPanel,
	};
}

export function resolveReaderSidebarEntryState(
	resolution: CachedIdResolution,
): ReaderSidebarEntryState {
	if ((resolution.status === 'valid' || resolution.status === 'error') && resolution.id) {
		return {
			href: `/books/${resolution.id}`,
			locked: false,
		};
	}

	return {
		href: undefined,
		locked: true,
	};
}
