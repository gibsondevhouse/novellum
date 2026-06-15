import type { Project } from '$lib/db/domain-types';
import { ApiError, apiGet } from '$lib/api-client.js';
import { deletePreference, getPreference, setPreference } from '$lib/preferences.js';

export const LAST_PROJECT_LOCAL_KEY = 'novellum_last_project_id';
export const LAST_PROJECT_PREF_KEY = 'app.lastProjectId';

export const READER_LOCAL_KEY = 'novellum:reader';
export const READER_PREF_KEY = 'app.readerMode';

export type ProjectValidationResult = 'valid' | 'not_found' | 'error';

export interface ReaderNavigationState {
	mode?: string;
	lastBookId?: string | null;
	pageIndex?: Record<string, number>;
}

export interface CachedIdResolution {
	id: string | null;
	status: 'empty' | 'valid' | 'invalid' | 'error';
}

export type RouteWorkspace =
	| 'home'
	| 'onboarding'
	| 'projects'
	| 'project-hub'
	| 'editor'
	| 'outline'
	| 'world-building'
	| 'continuity'
	| 'story-bible'
	| 'arcs'
	| 'nova'
	| 'settings'
	| 'books'
	| 'reader'
	| 'stories'
	| 'images'
	| 'styles'
	| 'unknown';

export type NovaRouteSurface = 'embedded-project' | 'global-exploratory' | 'none';

export interface RouteContextInput {
	pathname: string;
	searchParams?: URLSearchParams | string | Record<string, string | null | undefined>;
	params?: Record<string, string | null | undefined>;
	data?: Record<string, unknown>;
}

export interface RouteContextContract {
	pathname: string;
	workspace: RouteWorkspace;
	projectId: string | null;
	activeChapterId: string | null;
	activeSceneId: string | null;
	worldbuildingPath: string | null;
	isProjectScoped: boolean;
	novaSurface: NovaRouteSurface;
}

function inBrowser(): boolean {
	return typeof window !== 'undefined';
}

function cleanRouteId(value: string | null | undefined): string | null {
	const trimmed = value?.trim();
	if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
	return decodeURIComponent(trimmed);
}

function searchParam(
	searchParams: RouteContextInput['searchParams'],
	key: string,
): string | null {
	if (!searchParams) return null;
	if (searchParams instanceof URLSearchParams) return cleanRouteId(searchParams.get(key));
	if (typeof searchParams === 'string') {
		const raw = searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
		return cleanRouteId(new URLSearchParams(raw).get(key));
	}
	return cleanRouteId(searchParams[key] ?? null);
}

function entityIdFromData(data: Record<string, unknown> | undefined, key: string): string | null {
	const value = data?.[key];
	if (!value || typeof value !== 'object') return null;
	const id = (value as { id?: unknown }).id;
	return typeof id === 'string' ? cleanRouteId(id) : null;
}

function projectIdFromPath(pathname: string): string | null {
	const match = /^\/projects\/([^/]+)/.exec(pathname);
	return cleanRouteId(match?.[1]);
}

function chapterIdFromPath(pathname: string): string | null {
	const match = /\/chapters\/([^/]+)/.exec(pathname);
	return cleanRouteId(match?.[1]);
}

function workspaceFromPath(pathname: string): RouteWorkspace {
	if (pathname === '/') return 'home';
	if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) return 'onboarding';
	if (pathname === '/projects') return 'projects';
	if (/^\/projects\/[^/]+\/editor(\/|$)/.test(pathname)) return 'editor';
	if (/^\/projects\/[^/]+\/outline(\/|$)/.test(pathname)) return 'outline';
	if (/^\/projects\/[^/]+\/world-building(\/|$)/.test(pathname)) return 'world-building';
	if (/^\/projects\/[^/]+\/continuity(\/|$)/.test(pathname)) return 'continuity';
	if (/^\/projects\/[^/]+\/story-bible(\/|$)/.test(pathname)) return 'story-bible';
	if (/^\/projects\/[^/]+\/arcs(\/|$)/.test(pathname)) return 'arcs';
	if (/^\/projects\/[^/]+\/?$/.test(pathname)) return 'project-hub';
	if (pathname === '/nova' || pathname.startsWith('/nova/')) return 'nova';
	if (pathname === '/settings' || pathname.startsWith('/settings/')) return 'settings';
	if (/^\/books\/[^/]+/.test(pathname)) return 'reader';
	if (pathname === '/books' || pathname.startsWith('/books/')) return 'books';
	if (pathname === '/stories' || pathname.startsWith('/stories/')) return 'stories';
	if (pathname === '/images' || pathname.startsWith('/images/')) return 'images';
	if (pathname === '/styles' || pathname.startsWith('/styles/')) return 'styles';
	return 'unknown';
}

function worldbuildingPathFromRoute(pathname: string): string | null {
	const match = /^\/projects\/[^/]+\/world-building\/?(.*)$/.exec(pathname);
	const tail = match?.[1]?.replace(/\/$/, '') ?? '';
	return tail.length > 0 ? tail : null;
}

export function deriveRouteContext(input: RouteContextInput): RouteContextContract {
	const pathname = input.pathname || '/';
	const workspace = workspaceFromPath(pathname);
	const hasProjectPath = pathname.startsWith('/projects/');
	const projectId =
		projectIdFromPath(pathname) ?? (hasProjectPath ? cleanRouteId(input.params?.id ?? null) : null);
	const activeSceneId =
		searchParam(input.searchParams, 'sceneId') ??
		cleanRouteId(input.params?.sceneId ?? null) ??
		entityIdFromData(input.data, 'scene');
	const activeChapterId =
		searchParam(input.searchParams, 'chapterId') ??
		cleanRouteId(input.params?.chapterId ?? null) ??
		chapterIdFromPath(pathname) ??
		entityIdFromData(input.data, 'chapter');
	const isProjectScoped = projectId !== null;
	const novaSurface: NovaRouteSurface =
		workspace === 'nova' ? 'global-exploratory' : isProjectScoped ? 'embedded-project' : 'none';

	return {
		pathname,
		workspace,
		projectId,
		activeChapterId,
		activeSceneId,
		worldbuildingPath: worldbuildingPathFromRoute(pathname),
		isProjectScoped,
		novaSurface,
	};
}

function readLocalString(key: string): string | null {
	if (!inBrowser()) return null;
	try {
		const value = localStorage.getItem(key);
		return value && value.trim().length > 0 ? value : null;
	} catch {
		return null;
	}
}

function writeLocalString(key: string, value: string): void {
	if (!inBrowser()) return;
	try {
		localStorage.setItem(key, value);
	} catch {
		// localStorage is best effort only
	}
}

function removeLocalValue(key: string): void {
	if (!inBrowser()) return;
	try {
		localStorage.removeItem(key);
	} catch {
		// localStorage is best effort only
	}
}

function readReaderLocalState(): ReaderNavigationState {
	if (!inBrowser()) return {};
	try {
		const raw = localStorage.getItem(READER_LOCAL_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as ReaderNavigationState;
		if (!parsed || typeof parsed !== 'object') return {};
		return parsed;
	} catch {
		return {};
	}
}

export async function validateProjectId(id: string): Promise<ProjectValidationResult> {
	if (!id || id === 'undefined') return 'not_found';
	try {
		await apiGet<Project>(`/api/db/projects/${id}`);
		return 'valid';
	} catch (error) {
		if (error instanceof ApiError && error.status === 404) {
			return 'not_found';
		}
		return 'error';
	}
}

export async function readLastProjectId(): Promise<string | null> {
	const local = readLocalString(LAST_PROJECT_LOCAL_KEY);
	if (local) return local;

	const remote = await getPreference<string | null>(LAST_PROJECT_PREF_KEY, null);
	if (remote) {
		writeLocalString(LAST_PROJECT_LOCAL_KEY, remote);
	}
	return remote;
}

export async function persistLastProjectId(id: string): Promise<void> {
	if (!id || id === 'undefined') return;
	writeLocalString(LAST_PROJECT_LOCAL_KEY, id);
	await setPreference(LAST_PROJECT_PREF_KEY, id);
}

export async function clearLastProjectId(): Promise<void> {
	removeLocalValue(LAST_PROJECT_LOCAL_KEY);
	await deletePreference(LAST_PROJECT_PREF_KEY);
}

export async function resolveLastProjectId(): Promise<CachedIdResolution> {
	const id = await readLastProjectId();
	if (!id) return { id: null, status: 'empty' };

	const validation = await validateProjectId(id);
	if (validation === 'valid') return { id, status: 'valid' };
	if (validation === 'not_found') {
		await clearLastProjectId();
		return { id: null, status: 'invalid' };
	}

	return { id, status: 'error' };
}

export function readReaderNavigationState(): ReaderNavigationState {
	return readReaderLocalState();
}

export async function readReaderPreferenceState(): Promise<ReaderNavigationState | null> {
	return await getPreference<ReaderNavigationState | null>(READER_PREF_KEY, null);
}

export async function writeReaderNavigationState(state: ReaderNavigationState): Promise<void> {
	if (inBrowser()) {
		try {
			localStorage.setItem(READER_LOCAL_KEY, JSON.stringify(state));
		} catch {
			// localStorage is best effort only
		}
	}
	await setPreference(READER_PREF_KEY, state);
}

export async function readLastReadBookId(): Promise<string | null> {
	const local = readReaderLocalState().lastBookId;
	if (typeof local === 'string' && local.trim().length > 0) return local;

	const remote = await readReaderPreferenceState();
	const remoteId = remote?.lastBookId;
	if (typeof remoteId === 'string' && remoteId.trim().length > 0) {
		const merged: ReaderNavigationState = {
			...readReaderLocalState(),
			...remote,
			lastBookId: remoteId,
		};
		await writeReaderNavigationState(merged);
		return remoteId;
	}

	return null;
}

export async function setLastReadBookId(id: string): Promise<void> {
	if (!id || id === 'undefined') return;
	const merged: ReaderNavigationState = {
		...readReaderLocalState(),
		lastBookId: id,
	};
	await writeReaderNavigationState(merged);
}

export async function clearLastReadBookId(): Promise<void> {
	const merged: ReaderNavigationState = {
		...readReaderLocalState(),
		lastBookId: null,
	};
	await writeReaderNavigationState(merged);
}

export async function resolveLastReadBookId(): Promise<CachedIdResolution> {
	const id = await readLastReadBookId();
	if (!id) return { id: null, status: 'empty' };

	const validation = await validateProjectId(id);
	if (validation === 'valid') return { id, status: 'valid' };
	if (validation === 'not_found') {
		await clearLastReadBookId();
		return { id: null, status: 'invalid' };
	}

	return { id, status: 'error' };
}
