import { db } from '$lib/db/index.js';
import type { Location } from '$lib/db/types.js';

export async function createLocation(
	data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Location> {
	const now = new Date().toISOString();
	const location: Location = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.locations.add(location);
	return location;
}

export async function getLocationById(id: string): Promise<Location | undefined> {
	return db.locations.get(id);
}

export async function getLocationsByProjectId(projectId: string): Promise<Location[]> {
	return db.locations.where('projectId').equals(projectId).toArray();
}

export async function updateLocation(
	id: string,
	data: Partial<Omit<Location, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.locations.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeLocation(id: string): Promise<void> {
	await db.locations.delete(id);
}
