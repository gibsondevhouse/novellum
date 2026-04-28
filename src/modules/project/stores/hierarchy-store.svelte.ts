/**
 * Hierarchy Store — tracks the writer's current Arc → Act → Chapter selection
 * scoped per project. Selection state is keyed by `projectId` so navigating
 * between projects never leaks context.
 *
 * `null` is a meaningful selection meaning "unassigned" — it must round-trip
 * through getters and scoped helpers without throwing.
 *
 * @see plan-013-workspace-hierarchy-flow / stage-001-hierarchy-data-services
 */
import { SvelteMap } from 'svelte/reactivity';
import type { Act, Arc, Chapter, Scene } from '$lib/db/types.js';

interface ProjectSelection {
	arcId: string | null | undefined;
	actId: string | null | undefined;
	chapterId: string | null | undefined;
}

const selections = new SvelteMap<string, ProjectSelection>();

function current(projectId: string): ProjectSelection {
	return (
		selections.get(projectId) ?? { arcId: undefined, actId: undefined, chapterId: undefined }
	);
}

// --- Selection actions ---

export function selectArc(projectId: string, arcId: string | null): void {
	const entry = current(projectId);
	if (entry.arcId === arcId) return;
	// Switching arc invalidates downstream selection.
	selections.set(projectId, { arcId, actId: undefined, chapterId: undefined });
}

export function selectAct(projectId: string, actId: string | null): void {
	const entry = current(projectId);
	if (entry.actId === actId) return;
	selections.set(projectId, { arcId: entry.arcId, actId, chapterId: undefined });
}

export function selectChapter(projectId: string, chapterId: string | null): void {
	const entry = current(projectId);
	if (entry.chapterId === chapterId) return;
	selections.set(projectId, { arcId: entry.arcId, actId: entry.actId, chapterId });
}

export function resetForProject(projectId: string): void {
	if (!selections.has(projectId)) return;
	selections.delete(projectId);
}

// --- Getters (SvelteMap reads register reactivity) ---

export function getSelectedArcId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.arcId;
}

export function getSelectedActId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.actId;
}

export function getSelectedChapterId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.chapterId;
}

// --- Scoped list helpers ---
//
// These pure helpers operate on a fully-loaded payload (already fetched via
// the repositories) so consumers can build $derived views without re-issuing
// network calls. They preserve the "unassigned" group semantics: passing
// `null` returns records with no parent, passing a string returns records
// scoped to that parent, passing `undefined` returns the full list.

export function selectActsForArc(
	acts: Act[],
	arcId: string | null | undefined,
): Act[] {
	if (arcId === undefined) return acts;
	if (arcId === null) return acts.filter((a) => !a.arcId);
	return acts.filter((a) => a.arcId === arcId);
}

export function selectChaptersForAct(
	chapters: Chapter[],
	actId: string | null | undefined,
): Chapter[] {
	if (actId === undefined) return chapters;
	if (actId === null) return chapters.filter((c) => !c.actId);
	return chapters.filter((c) => c.actId === actId);
}

export function selectScenesForChapter(
	scenes: Scene[],
	chapterId: string | null | undefined,
): Scene[] {
	if (chapterId === undefined) return scenes;
	if (chapterId === null) return scenes.filter((s) => !s.chapterId);
	return scenes.filter((s) => s.chapterId === chapterId);
}

// Convenience finders used by the workspace shells.

export function getSelectedArc(projectId: string, arcs: Arc[]): Arc | null {
	const id = getSelectedArcId(projectId);
	if (!id) return null;
	return arcs.find((a) => a.id === id) ?? null;
}

export function getSelectedAct(projectId: string, acts: Act[]): Act | null {
	const id = getSelectedActId(projectId);
	if (!id) return null;
	return acts.find((a) => a.id === id) ?? null;
}

export function getSelectedChapter(
	projectId: string,
	chapters: Chapter[],
): Chapter | null {
	const id = getSelectedChapterId(projectId);
	if (!id) return null;
	return chapters.find((c) => c.id === id) ?? null;
}
