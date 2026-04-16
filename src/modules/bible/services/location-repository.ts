import { createRepository } from '$lib/factories/repository-factory.js';
import type { Location } from '$lib/db/types.js';

const repo = createRepository<Location>({
	endpoint: '/api/db/locations',
	entityName: 'Location',
});

export const createLocation = repo.create;
export const getLocationById = repo.getById;
export const getLocationsByProjectId = repo.getByProjectId;
export const updateLocation = repo.update;
export const removeLocation = repo.remove;
