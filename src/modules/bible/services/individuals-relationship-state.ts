export type IndividualsRelationship = {
	id: string;
	targetCharacterId: string;
	relationshipType: string;
	status?: string;
	notes?: string;
};

export type IndividualsCharacterRecord = {
	id: string;
	relationships: IndividualsRelationship[];
	[key: string]: unknown;
};

type RelationshipField = keyof Omit<IndividualsRelationship, 'id'>;

export function updateRelationshipReciprocal<T extends IndividualsCharacterRecord>(
	records: Record<string, T>,
	sourceCharacterId: string,
	index: number,
	field: RelationshipField,
	value: string,
): {
	nextRecords: Record<string, T>;
	previousRelationship: IndividualsRelationship | null;
	updatedRelationship: IndividualsRelationship | null;
} {
	const current = records[sourceCharacterId];
	if (!current || !current.relationships[index]) {
		return {
			nextRecords: records,
			previousRelationship: null,
			updatedRelationship: null,
		};
	}

	const previousRelationship = current.relationships[index];
	const relationships = [...current.relationships];
	relationships[index] = {
		...relationships[index],
		[field]: value,
	};

	const updatedRelationship = relationships[index];
	const nextRecords = { ...records };

	if (field === 'targetCharacterId') {
		const previousTarget = nextRecords[previousRelationship.targetCharacterId];
		if (previousTarget) {
			nextRecords[previousRelationship.targetCharacterId] = {
				...previousTarget,
				relationships: previousTarget.relationships.filter(
					(relationship) => relationship.id !== previousRelationship.id,
				),
			};
		}

		const nextTarget = nextRecords[updatedRelationship.targetCharacterId];
		if (nextTarget) {
			const targetRelationships = [...nextTarget.relationships];
			const mirrorIndex = targetRelationships.findIndex(
				(relationship) => relationship.id === updatedRelationship.id,
			);
			const mirroredRelationship: IndividualsRelationship = {
				id: updatedRelationship.id,
				targetCharacterId: sourceCharacterId,
				relationshipType: updatedRelationship.relationshipType,
				status: updatedRelationship.status,
				notes: updatedRelationship.notes,
			};

			if (mirrorIndex >= 0) {
				targetRelationships[mirrorIndex] = mirroredRelationship;
			} else {
				targetRelationships.push(mirroredRelationship);
			}

			nextRecords[updatedRelationship.targetCharacterId] = {
				...nextTarget,
				relationships: targetRelationships,
			};
		}
	} else {
		const target = nextRecords[updatedRelationship.targetCharacterId];
		if (target) {
			const targetRelationships = [...target.relationships];
			const mirrorIndex = targetRelationships.findIndex(
				(relationship) => relationship.id === updatedRelationship.id,
			);
			if (mirrorIndex >= 0) {
				targetRelationships[mirrorIndex] = {
					...targetRelationships[mirrorIndex],
					[field]: value,
				};
				nextRecords[updatedRelationship.targetCharacterId] = {
					...target,
					relationships: targetRelationships,
				};
			}
		}
	}

	nextRecords[sourceCharacterId] = {
		...current,
		relationships,
	};

	return {
		nextRecords,
		previousRelationship,
		updatedRelationship,
	};
}

export function addRelationshipReciprocal<T extends IndividualsCharacterRecord>(
	records: Record<string, T>,
	sourceCharacterId: string,
	relationship: Omit<IndividualsRelationship, 'id'> & { id: string },
): Record<string, T> {
	const current = records[sourceCharacterId];
	if (!current) return records;

	const nextRecords = { ...records };
	nextRecords[sourceCharacterId] = {
		...current,
		relationships: [...current.relationships, relationship],
	};

	const target = nextRecords[relationship.targetCharacterId];
	if (target) {
		const hasMirror = target.relationships.some((existing) => existing.id === relationship.id);
		if (!hasMirror) {
			nextRecords[relationship.targetCharacterId] = {
				...target,
				relationships: [
					...target.relationships,
					{
						id: relationship.id,
						targetCharacterId: sourceCharacterId,
						relationshipType: relationship.relationshipType,
						status: relationship.status,
						notes: relationship.notes,
					},
				],
			};
		}
	}

	return nextRecords;
}

export function removeRelationshipReciprocal<T extends IndividualsCharacterRecord>(
	records: Record<string, T>,
	sourceCharacterId: string,
	index: number,
): {
	nextRecords: Record<string, T>;
	removedRelationship: IndividualsRelationship | null;
} {
	const current = records[sourceCharacterId];
	if (!current || !current.relationships[index]) {
		return { nextRecords: records, removedRelationship: null };
	}

	const removedRelationship = current.relationships[index];
	const nextRecords = { ...records };
	nextRecords[sourceCharacterId] = {
		...current,
		relationships: current.relationships.filter((_, relationshipIndex) => relationshipIndex !== index),
	};

	const target = nextRecords[removedRelationship.targetCharacterId];
	if (target) {
		nextRecords[removedRelationship.targetCharacterId] = {
			...target,
			relationships: target.relationships.filter(
				(relationship) => relationship.id !== removedRelationship.id,
			),
		};
	}

	return { nextRecords, removedRelationship };
}
