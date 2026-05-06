import { describe, expect, it } from 'vitest';
import {
	addRelationshipReciprocal,
	removeRelationshipReciprocal,
	updateRelationshipReciprocal,
	type IndividualsCharacterRecord,
} from '../../src/modules/world-building/services/individuals-relationship-state.js';

type TestCharacterRecord = IndividualsCharacterRecord & {
	name: string;
	role?: string;
	summary?: string;
	biography?: string;
};

function makeRecords(): Record<string, TestCharacterRecord> {
	return {
		'a': { id: 'a', name: 'A', relationships: [] },
		'b': { id: 'b', name: 'B', relationships: [] },
		'c': { id: 'c', name: 'C', relationships: [] },
	};
}

describe('Individuals relationship interaction flow', () => {
	it('add creates reciprocal rows on source and target', () => {
		const records = makeRecords();
		const next = addRelationshipReciprocal(records, 'a', {
			id: 'rel-1',
			targetCharacterId: 'b',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});

		expect(next.a.relationships).toHaveLength(1);
		expect(next.a.relationships[0]).toMatchObject({
			id: 'rel-1',
			targetCharacterId: 'b',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});
		expect(next.b.relationships).toHaveLength(1);
		expect(next.b.relationships[0]).toMatchObject({
			id: 'rel-1',
			targetCharacterId: 'a',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});
	});

	it('edit updates reciprocal fields', () => {
		const seeded = addRelationshipReciprocal(makeRecords(), 'a', {
			id: 'rel-1',
			targetCharacterId: 'b',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});

		const statusUpdated = updateRelationshipReciprocal(
			seeded,
			'a',
			0,
			'status',
			'Volatile',
		);
		expect(statusUpdated.nextRecords.a.relationships[0].status).toBe('Volatile');
		expect(statusUpdated.nextRecords.b.relationships[0].status).toBe('Volatile');

		const noteUpdated = updateRelationshipReciprocal(
			statusUpdated.nextRecords,
			'a',
			0,
			'notes',
			'Trust has eroded',
		);
		expect(noteUpdated.nextRecords.a.relationships[0].notes).toBe('Trust has eroded');
		expect(noteUpdated.nextRecords.b.relationships[0].notes).toBe('Trust has eroded');
	});

	it('retarget moves reciprocal relationship to the new character', () => {
		const seeded = addRelationshipReciprocal(makeRecords(), 'a', {
			id: 'rel-1',
			targetCharacterId: 'b',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});

		const retargeted = updateRelationshipReciprocal(seeded, 'a', 0, 'targetCharacterId', 'c');
		expect(retargeted.nextRecords.a.relationships[0].targetCharacterId).toBe('c');
		expect(retargeted.nextRecords.b.relationships).toHaveLength(0);
		expect(retargeted.nextRecords.c.relationships).toHaveLength(1);
		expect(retargeted.nextRecords.c.relationships[0]).toMatchObject({
			id: 'rel-1',
			targetCharacterId: 'a',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});
	});

	it('remove deletes relationship from both source and target', () => {
		const seeded = addRelationshipReciprocal(makeRecords(), 'a', {
			id: 'rel-1',
			targetCharacterId: 'b',
			relationshipType: 'Ally',
			status: 'Stable',
			notes: 'Known since childhood',
		});

		const removed = removeRelationshipReciprocal(seeded, 'a', 0);
		expect(removed.removedRelationship?.id).toBe('rel-1');
		expect(removed.nextRecords.a.relationships).toHaveLength(0);
		expect(removed.nextRecords.b.relationships).toHaveLength(0);
	});
});
