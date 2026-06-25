import { describe, expect, it } from 'vitest';
import {
	buildDossierLinkHref,
	createDossierLinkIndex,
	resolveDossierLinks,
} from '$modules/story-bible/services/dossier-link-resolver.js';

describe('dossier link resolver', () => {
	it('maps character and location markers to link segments', () => {
		const index = createDossierLinkIndex({
			characters: [
				{
					id: 'char-1',
					projectId: 'project-1',
					name: 'Mira Vale',
					role: '',
					pronunciation: '',
					aliases: [],
					diasporaOrigin: '',
					photoUrl: '',
					bio: '',
					faction: '',
					anomalies: [],
					traits: [],
					goals: [],
					flaws: [],
					arcs: [],
					notes: '',
					tags: [],
					createdAt: '',
					updatedAt: '',
				},
			],
			locations: [
				{
					id: 'loc-1',
					projectId: 'project-1',
					name: 'Glass Harbor',
					description: '',
					tags: [],
					createdAt: '',
					updatedAt: '',
				},
			],
		});

		const segments = resolveDossierLinks('Meet @character:char-1 near #location:loc-1.', index);

		expect(segments).toEqual([
			{ type: 'text', text: 'Meet ' },
			{
				type: 'link',
				text: 'Mira Vale',
				marker: '@character:char-1',
				target: {
					referenceKind: 'character',
					kind: 'characters',
					id: 'char-1',
					label: 'Mira Vale',
				},
			},
			{ type: 'text', text: ' near ' },
			{
				type: 'link',
				text: 'Glass Harbor',
				marker: '#location:loc-1',
				target: {
					referenceKind: 'location',
					kind: 'locations',
					id: 'loc-1',
					label: 'Glass Harbor',
				},
			},
			{ type: 'text', text: '.' },
		]);
	});

	it('keeps invalid IDs as static text', () => {
		const segments = resolveDossierLinks('@character:missing stays literal', new Map());

		expect(segments).toEqual([
			{ type: 'text', text: '@character:missing' },
			{ type: 'text', text: ' stays literal' },
		]);
	});

	it('builds story bible hash hrefs for resolved targets', () => {
		expect(
			buildDossierLinkHref('project-1', {
				referenceKind: 'theme',
				kind: 'themes',
				id: 'theme-1',
				label: 'Truth',
			}),
		).toBe('/projects/project-1/story-bible#theme:theme-1');
	});
});
