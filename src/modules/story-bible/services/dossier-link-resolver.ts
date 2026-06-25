import type {
	Character,
	Faction,
	GlossaryTerm,
	Location,
	LoreEntry,
	Theme,
} from '$lib/db/domain-types';
import type { StoryBibleDossierKind } from './story-bible-crud.js';

export type DossierReferenceKind =
	| 'character'
	| 'location'
	| 'faction'
	| 'glossary'
	| 'theme'
	| 'lore';

export interface DossierLinkTarget {
	referenceKind: DossierReferenceKind;
	kind: StoryBibleDossierKind;
	id: string;
	label: string;
}

export type DossierLinkSegment =
	| {
			type: 'text';
			text: string;
	  }
	| {
			type: 'link';
			text: string;
			marker: string;
			target: DossierLinkTarget;
	  };

export interface DossierLinkIndexInput {
	characters?: readonly Character[];
	locations?: readonly Location[];
	factions?: readonly Faction[];
	glossaryTerms?: readonly GlossaryTerm[];
	themes?: readonly Theme[];
	loreEntries?: readonly LoreEntry[];
}

export type DossierLinkIndex = ReadonlyMap<string, DossierLinkTarget>;

const MARKER_PATTERN = /([@#])(character|location|faction|glossary|theme|lore):([A-Za-z0-9_-]+)/g;

const REFERENCE_KIND_TO_DOSSIER_KIND: Record<DossierReferenceKind, StoryBibleDossierKind> = {
	character: 'characters',
	location: 'locations',
	faction: 'factions',
	glossary: 'glossaryTerms',
	theme: 'themes',
	lore: 'loreEntries',
};

function indexKey(referenceKind: DossierReferenceKind, id: string): string {
	return `${referenceKind}:${id}`;
}

function addTarget(
	index: Map<string, DossierLinkTarget>,
	referenceKind: DossierReferenceKind,
	id: string,
	label: string,
): void {
	if (!id || !label) return;
	index.set(indexKey(referenceKind, id), {
		referenceKind,
		kind: REFERENCE_KIND_TO_DOSSIER_KIND[referenceKind],
		id,
		label,
	});
}

export function createDossierLinkIndex(input: DossierLinkIndexInput): DossierLinkIndex {
	const index = new Map<string, DossierLinkTarget>();

	for (const character of input.characters ?? []) {
		addTarget(index, 'character', character.id, character.name);
	}
	for (const location of input.locations ?? []) {
		addTarget(index, 'location', location.id, location.name);
	}
	for (const faction of input.factions ?? []) {
		addTarget(index, 'faction', faction.id, faction.name);
	}
	for (const term of input.glossaryTerms ?? []) {
		addTarget(index, 'glossary', term.id, term.term);
	}
	for (const theme of input.themes ?? []) {
		addTarget(index, 'theme', theme.id, theme.title);
	}
	for (const entry of input.loreEntries ?? []) {
		addTarget(index, 'lore', entry.id, entry.title);
	}

	return index;
}

export function resolveDossierLinks(text: string, index: DossierLinkIndex): DossierLinkSegment[] {
	if (!text) return [];

	const segments: DossierLinkSegment[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(MARKER_PATTERN)) {
		const marker = match[0];
		const start = match.index ?? 0;
		const referenceKind = match[2] as DossierReferenceKind;
		const id = match[3];
		const target = index.get(indexKey(referenceKind, id));

		if (start > lastIndex) {
			segments.push({ type: 'text', text: text.slice(lastIndex, start) });
		}

		if (target) {
			segments.push({ type: 'link', text: target.label, marker, target });
		} else {
			segments.push({ type: 'text', text: marker });
		}

		lastIndex = start + marker.length;
	}

	if (lastIndex < text.length) {
		segments.push({ type: 'text', text: text.slice(lastIndex) });
	}

	return segments;
}

export function buildDossierLinkHref(projectId: string, target: DossierLinkTarget): string {
	return `/projects/${projectId}/story-bible#${target.referenceKind}:${target.id}`;
}
