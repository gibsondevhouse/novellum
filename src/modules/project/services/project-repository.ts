import { db } from '$lib/db/index.js';
import type { Project } from '$lib/db/types.js';

export async function createProject(
	data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
	const now = new Date().toISOString();
	const project: Project = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.projects.add(project);
	return project;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
	return db.projects.get(id);
}

export async function getAllProjects(): Promise<Project[]> {
	return db.projects.orderBy('createdAt').reverse().toArray();
}

export async function updateProject(
	id: string,
	data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.projects.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeProject(id: string): Promise<void> {
	await db.projects.delete(id);
}
