export interface EntityCrudConfig<T extends { id: string }> {
	create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
	update?: (id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>) => Promise<void>;
	remove: (id: string) => Promise<void>;
	entityName: string;
}

export interface EntityCrudStore<T extends { id: string }> {
	getList(): T[];
	getSaving(): boolean;
	getError(): string | null;
	initList(list: T[]): void;
	submitCreate(
		projectId: string,
		data: Omit<T, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	): Promise<T>;
	submitUpdate(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void>;
	submitDelete(id: string): Promise<void>;
}

export interface EntityCrudLiteStore<T extends { id: string }> {
	getList(): T[];
	initList(list: T[]): void;
	submitCreate(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
	submitDelete(id: string): Promise<void>;
}

export function createEntityCrudStore<T extends { id: string }>(
	config: EntityCrudConfig<T>,
): EntityCrudStore<T> {
	let items: T[] = $state([]);
	let saving = $state(false);
	let error: string | null = $state(null);

	return {
		getList() {
			return items;
		},
		getSaving() {
			return saving;
		},
		getError() {
			return error;
		},
		initList(list: T[]) {
			items = list;
		},
		async submitCreate(
			projectId: string,
			data: Omit<T, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
		): Promise<T> {
			saving = true;
			error = null;
			try {
				const entity = await config.create(
					{ ...data, projectId } as Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
				);
				items = [...items, entity];
				return entity;
			} catch {
				error = `Failed to save ${config.entityName}.`;
				throw new Error(error);
			} finally {
				saving = false;
			}
		},
		async submitUpdate(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
			if (!config.update) return;
			saving = true;
			error = null;
			try {
				await config.update(id, data as Partial<Omit<T, 'id' | 'createdAt'>>);
				items = items.map((item) => (item.id === id ? { ...item, ...data } : item));
			} catch {
				error = `Failed to update ${config.entityName}.`;
			} finally {
				saving = false;
			}
		},
		async submitDelete(id: string): Promise<void> {
			await config.remove(id);
			items = items.filter((item) => item.id !== id);
		},
	};
}

export function createEntityCrudLiteStore<T extends { id: string }>(
	config: Omit<EntityCrudConfig<T>, 'update' | 'entityName'>,
): EntityCrudLiteStore<T> {
	let items: T[] = $state([]);

	return {
		getList() {
			return items;
		},
		initList(list: T[]) {
			items = list;
		},
		async submitCreate(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
			const entity = await config.create(data);
			items = [...items, entity];
		},
		async submitDelete(id: string): Promise<void> {
			await config.remove(id);
			items = items.filter((item) => item.id !== id);
		},
	};
}
