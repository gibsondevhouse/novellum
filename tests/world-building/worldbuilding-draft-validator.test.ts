import { describe, expect, it } from 'vitest';
import { validateGeneratedDrafts } from '../../src/lib/ai/validators/worldbuilding-draft-validator.js';

describe('validateGeneratedDrafts — character', () => {
	it('normalizes a valid character draft', () => {
		const result = validateGeneratedDrafts(
			[
				{
					name: 'Oayara',
					role: 'Courier',
					bio: 'A reluctant hero.',
					faction: 'Free Runners',
					coreDesire: 'Freedom',
					fear: 'Capture',
					contradiction: 'Brave but secretly terrified',
					strength: 'Speed',
					flaw: 'Impulsive',
					storyRole: 'Protagonist',
					externalGoal: 'Deliver the message',
					internalNeed: 'Trust others',
					stakes: 'Civil war outcome',
					voiceSummary: 'Clipped and precise',
					speechPattern: 'Short declarative sentences',
					traits: ['swift', 'stubborn'],
					goals: ['survive'],
					flaws: ['overconfident'],
					tags: ['main'],
					notes: 'Core arc character',
				},
			],
			'character',
			1,
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.drafts).toHaveLength(1);
		expect(result.droppedCount).toBe(0);
		const draft = result.drafts[0] as Record<string, unknown>;
		expect(draft.name).toBe('Oayara');
		expect(draft.coreDesire).toBe('Freedom');
		expect(draft.voiceSummary).toBe('Clipped and precise');
	});

	it('defaults missing optional fields to empty string / empty array', () => {
		const result = validateGeneratedDrafts([{ name: 'Thorn' }], 'character', 1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const draft = result.drafts[0] as Record<string, unknown>;
		expect(draft.bio).toBe('');
		expect(draft.coreDesire).toBe('');
		expect(draft.traits).toEqual([]);
	});

	it('drops drafts with missing name', () => {
		const result = validateGeneratedDrafts(
			[{ role: 'wanderer', bio: 'Unknown origins' }],
			'character',
			1,
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('all_invalid');
		expect(result.error.droppedCount).toBe(1);
	});

	it('retains valid drafts and drops invalid ones from a mixed array', () => {
		const result = validateGeneratedDrafts(
			[
				{ role: 'wanderer' }, // invalid — no name
				{ name: 'Kaela', role: 'Scout' }, // valid
				'not-an-object', // invalid — not a record
			],
			'character',
			5,
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.drafts).toHaveLength(1);
		expect(result.droppedCount).toBe(2);
		const draft = result.drafts[0] as Record<string, unknown>;
		expect(draft.name).toBe('Kaela');
	});

	it('caps results at maxCount', () => {
		const raw = Array.from({ length: 5 }, (_, i) => ({ name: `Char${i}` }));
		const result = validateGeneratedDrafts(raw, 'character', 3);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.drafts).toHaveLength(3);
	});
});

describe('validateGeneratedDrafts — faction', () => {
	it('normalizes a valid faction draft', () => {
		const result = validateGeneratedDrafts(
			[{ name: 'Ash Court', type: 'guild', description: 'Shadowy traders', mission: 'Control trade', ideology: 'Profit above all' }],
			'faction',
			1,
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const draft = result.drafts[0] as Record<string, unknown>;
		expect(draft.name).toBe('Ash Court');
		expect(draft.type).toBe('guild');
	});

	it('drops faction drafts with no name', () => {
		const result = validateGeneratedDrafts([{ type: 'guild' }], 'faction', 1);
		expect(result.ok).toBe(false);
	});
});

describe('validateGeneratedDrafts — lineage', () => {
	it('normalizes a valid lineage draft', () => {
		const result = validateGeneratedDrafts(
			[{ name: 'House Tal', lineageType: 'dynasty', summary: 'Ancient merchants', origin: 'Northern Reaches', regionHomeland: 'Talmoor', currentStatus: 'fractured', foundingOrigin: 'Succession war', inheritedValues: 'Loyalty' }],
			'lineage',
			1,
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const draft = result.drafts[0] as Record<string, unknown>;
		expect(draft.name).toBe('House Tal');
	});
});

describe('validateGeneratedDrafts — lore-entry', () => {
	it('requires title, not name', () => {
		const valid = validateGeneratedDrafts(
			[{ title: 'The Rite of Ash', category: 'myth', content: '...', tags: [] }],
			'lore-entry',
			1,
		);
		expect(valid.ok).toBe(true);

		const missingTitle = validateGeneratedDrafts([{ category: 'myth' }], 'lore-entry', 1);
		expect(missingTitle.ok).toBe(false);
	});
});

describe('validateGeneratedDrafts — all invalid', () => {
	it('returns all_invalid error when no drafts survive', () => {
		const result = validateGeneratedDrafts(
			[{ role: 'extra' }, { role: 'another' }],
			'character',
			3,
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe('all_invalid');
		expect(result.error.droppedCount).toBe(2);
	});

	it('handles empty input array', () => {
		const result = validateGeneratedDrafts([], 'character', 1);
		expect(result.ok).toBe(false);
	});
});
