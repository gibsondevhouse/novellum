import { db } from '$lib/db/index.js';
import type { PlotThread } from '$lib/db/types.js';

export async function createPlotThread(
	data: Omit<PlotThread, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<PlotThread> {
	const now = new Date().toISOString();
	const thread: PlotThread = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.plot_threads.add(thread);
	return thread;
}

export async function getPlotThreadById(id: string): Promise<PlotThread | undefined> {
	return db.plot_threads.get(id);
}

export async function getPlotThreadsByProjectId(projectId: string): Promise<PlotThread[]> {
	return db.plot_threads.where('projectId').equals(projectId).toArray();
}

export async function updatePlotThread(
	id: string,
	data: Partial<Omit<PlotThread, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.plot_threads.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removePlotThread(id: string): Promise<void> {
	await db.plot_threads.delete(id);
}
