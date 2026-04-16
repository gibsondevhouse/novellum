import { createRepository } from '$lib/factories/repository-factory.js';
import type { PlotThread } from '$lib/db/types.js';

const repo = createRepository<PlotThread>({
	endpoint: '/api/db/plot_threads',
	entityName: 'PlotThread',
});

export const createPlotThread = repo.create;
export const getPlotThreadById = repo.getById;
export const getPlotThreadsByProjectId = repo.getByProjectId;
export const updatePlotThread = repo.update;
export const removePlotThread = repo.remove;
