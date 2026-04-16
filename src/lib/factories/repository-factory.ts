import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';

export interface RepositoryConfig {
	endpoint: string;
	entityName: string;
	hasReorder?: boolean;
	queries?: Record<string, string>;
}

export interface Repository<T extends { id: string }> {
	create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
	getById(id: string): Promise<T | undefined>;
	getByProjectId(projectId: string): Promise<T[]>;
	update(id: string, changes: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void>;
	remove(id: string): Promise<void>;
	reorder?: (orderedIds: string[]) => Promise<void>;
	queries: Record<string, (...args: string[]) => Promise<T[]>>;
}

export function createRepository<T extends { id: string }>(
	config: RepositoryConfig,
): Repository<T> {
	const { endpoint, hasReorder, queries: queryDefs } = config;

	const builtQueries: Record<string, (...args: string[]) => Promise<T[]>> = {};
	if (queryDefs) {
		for (const [name, paramKey] of Object.entries(queryDefs)) {
			builtQueries[name] = (value: string) => apiGet<T[]>(endpoint, { [paramKey]: value });
		}
	}

	return {
		create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
			return apiPost<T>(endpoint, data);
		},

		async getById(id: string): Promise<T | undefined> {
			try {
				return await apiGet<T>(`${endpoint}/${id}`);
			} catch (err) {
				if (err instanceof ApiError && err.status === 404) return undefined;
				throw err;
			}
		},

		getByProjectId(projectId: string): Promise<T[]> {
			return apiGet<T[]>(endpoint, { projectId });
		},

		async update(id: string, changes: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
			await apiPut(`${endpoint}/${id}`, changes);
		},

		async remove(id: string): Promise<void> {
			await apiDel(`${endpoint}/${id}`);
		},

		...(hasReorder
			? {
					async reorder(orderedIds: string[]): Promise<void> {
						await apiPut(`${endpoint}/reorder`, { orderedIds });
					},
				}
			: {}),

		queries: builtQueries,
	};
}
