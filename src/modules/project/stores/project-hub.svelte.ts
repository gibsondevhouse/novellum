import { goto } from '$app/navigation';
import {
	getAllProjects,
	createProject,
	getProjectById,
	updateProject,
	removeProject,
} from '../services/project-repository.js';
import type { Project } from '$lib/db/types.js';

// --- List state ---
let projects: Project[] = $state([]);
let loading = $state(false);
let creating = $state(false);
let createError: string | null = $state(null);

// --- Detail state ---
let currentProject: Project | null = $state(null);
let saving = $state(false);
let saveSuccess = $state(false);
let deleting = $state(false);

// --- Getters ---
export function getProjects() {
	return projects;
}
export function getLoading() {
	return loading;
}
export function getCreating() {
	return creating;
}
export function getCreateError() {
	return createError;
}
export function getCurrentProject() {
	return currentProject;
}
export function getSaving() {
	return saving;
}
export function getSaveSuccess() {
	return saveSuccess;
}
export function getDeleting() {
	return deleting;
}

// --- Actions ---
export async function loadProjects(): Promise<void> {
	loading = true;
	try {
		projects = await getAllProjects();
	} finally {
		loading = false;
	}
}

export async function submitCreate(data: {
	title: string;
	genre?: string[];
	logline?: string;
	synopsis?: string;
	targetWordCount?: number;
}): Promise<void> {
	creating = true;
	createError = null;
	try {
		const project = await createProject({
			title: data.title,
			genre: data.genre?.join(', ') ?? '',
			logline: data.logline ?? '',
			synopsis: data.synopsis ?? '',
			targetWordCount: data.targetWordCount ?? 80000,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
		});
		// active project store update removed as it's now reactively derived from URL
		goto(`/projects/${project.id}`);
	} catch {
		createError = 'Failed to create project. Please try again.';
	} finally {
		creating = false;
	}
}

export function selectProject(project: Project): void {
	// active project store update removed as it's now reactively derived from URL
	goto(`/projects/${project.id}`);
}

export function initCurrentProject(project: Project): void {
	currentProject = project;
	saveSuccess = false;
}

export async function submitUpdate(
	id: string,
	data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void> {
	saving = true;
	saveSuccess = false;
	try {
		await updateProject(id, data);
		currentProject = (await getProjectById(id)) ?? null;
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 2000);
	} finally {
		saving = false;
	}
}

export async function submitDelete(id: string): Promise<void> {
	deleting = true;
	try {
		await removeProject(id);
		goto('/');
	} finally {
		deleting = false;
	}
}
