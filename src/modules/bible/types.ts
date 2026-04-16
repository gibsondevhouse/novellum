// Story Bible module public types

export type BibleEntryId = number;

/** Strips DB-managed fields from an entity type for form submission. */
export type EntityFormData<T> = Omit<T, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;

/** Standard callback props shared by all bible entity forms. */
export type EntityFormCallbacks<T> = {
	onSave: (data: EntityFormData<T>) => void;
	onCancel: () => void;
	onDelete?: (id: string) => void;
};
