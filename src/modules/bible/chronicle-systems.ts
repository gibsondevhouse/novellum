import type { TimelineEvent } from '$lib/db/types.js';

export type ChronicleSystemKind = 'era' | 'key-event' | 'personal-history';

export type EraPayload = {
	kind: 'era';
	name: string;
	eraType: string;
	narrativeSpan: string;
	openingCondition: string;
	definingConflict: string;
	dominantPowers: string;
	culturalState: string;
	technologicalState: string;
	spiritualState: string;
	turningPoint: string;
	endingCondition: string;
	narrativeFunction: string;
	continuityNotes: string;
	characterIds: string[];
	factionIds: string[];
	realmIds: string[];
	keyEventIds: string[];
};

export type KeyEventPayload = {
	kind: 'key-event';
	title: string;
	eventType: string;
	narrativeDate: string;
	relatedEraId: string;
	trigger: string;
	eventSummary: string;
	immediateConsequence: string;
	longTermConsequence: string;
	stakes: string;
	narrativeFunction: string;
	continuityImpact: string;
	characterIds: string[];
	factionIds: string[];
	realmIds: string[];
	sceneIds: string[];
};

export type PersonalHistoryPayload = {
	kind: 'personal-history';
	title: string;
	subjectCharacterId: string;
	historyType: string;
	timeframe: string;
	formativeEvent: string;
	woundOrLesson: string;
	secretOrOmission: string;
	unresolvedConsequence: string;
	presentBehavior: string;
	relationshipImpact: string;
	arcImpact: string;
	continuityNotes: string;
	relatedCharacterIds: string[];
	arcIds: string[];
	keyEventIds: string[];
};

export type ChronicleSystemPayload = EraPayload | KeyEventPayload | PersonalHistoryPayload;

export const ERA_TYPES = [
	'Founding Era',
	'Golden Age',
	'Occupation / Rule',
	'Collapse',
	'Reconstruction',
	'Hidden Age',
	'Mythic Age',
	'Custom',
] as const;

export const KEY_EVENT_TYPES = [
	'Inciting Event',
	'Political Event',
	'Battle / Conflict',
	'Discovery',
	'Betrayal',
	'Catastrophe',
	'Revelation',
	'Death',
	'Birth / Creation',
	'Custom',
] as const;

export const PERSONAL_HISTORY_TYPES = [
	'Childhood',
	'Training',
	'Trauma',
	'Relationship',
	'Betrayal',
	'Exile',
	'Calling',
	'Loss',
	'Secret',
	'Custom',
] as const;

export function parseChroniclePayload(event: TimelineEvent): ChronicleSystemPayload | null {
	if (!event.description?.trim()) return null;
	try {
		const parsed = JSON.parse(event.description) as Partial<ChronicleSystemPayload>;
		if (
			parsed.kind === 'era' ||
			parsed.kind === 'key-event' ||
			parsed.kind === 'personal-history'
		) {
			return parsed as ChronicleSystemPayload;
		}
		return null;
	} catch {
		return null;
	}
}

function emptyEra(): EraPayload {
	return {
		kind: 'era',
		name: '',
		eraType: '',
		narrativeSpan: '',
		openingCondition: '',
		definingConflict: '',
		dominantPowers: '',
		culturalState: '',
		technologicalState: '',
		spiritualState: '',
		turningPoint: '',
		endingCondition: '',
		narrativeFunction: '',
		continuityNotes: '',
		characterIds: [],
		factionIds: [],
		realmIds: [],
		keyEventIds: [],
	};
}

function emptyKeyEvent(): KeyEventPayload {
	return {
		kind: 'key-event',
		title: '',
		eventType: '',
		narrativeDate: '',
		relatedEraId: '',
		trigger: '',
		eventSummary: '',
		immediateConsequence: '',
		longTermConsequence: '',
		stakes: '',
		narrativeFunction: '',
		continuityImpact: '',
		characterIds: [],
		factionIds: [],
		realmIds: [],
		sceneIds: [],
	};
}

function emptyPersonalHistory(): PersonalHistoryPayload {
	return {
		kind: 'personal-history',
		title: '',
		subjectCharacterId: '',
		historyType: '',
		timeframe: '',
		formativeEvent: '',
		woundOrLesson: '',
		secretOrOmission: '',
		unresolvedConsequence: '',
		presentBehavior: '',
		relationshipImpact: '',
		arcImpact: '',
		continuityNotes: '',
		relatedCharacterIds: [],
		arcIds: [],
		keyEventIds: [],
	};
}

export function eraDefaults(source: TimelineEvent | null): EraPayload {
	const base = emptyEra();
	if (!source) return base;
	const payload = parseChroniclePayload(source);
	if (payload?.kind === 'era') {
		return {
			...base,
			...payload,
			characterIds: payload.characterIds ?? source.relatedCharacterIds ?? [],
		};
	}
	// Legacy fallback
	return {
		...base,
		name: source.title ?? '',
		narrativeSpan: source.date ?? '',
		continuityNotes: source.description ?? '',
		characterIds: source.relatedCharacterIds ?? [],
	};
}

export function keyEventDefaults(source: TimelineEvent | null): KeyEventPayload {
	const base = emptyKeyEvent();
	if (!source) return base;
	const payload = parseChroniclePayload(source);
	if (payload?.kind === 'key-event') {
		return {
			...base,
			...payload,
			characterIds: payload.characterIds ?? source.relatedCharacterIds ?? [],
			sceneIds: payload.sceneIds ?? source.relatedSceneIds ?? [],
		};
	}
	return {
		...base,
		title: source.title ?? '',
		narrativeDate: source.date ?? '',
		eventSummary: source.description ?? '',
		characterIds: source.relatedCharacterIds ?? [],
		sceneIds: source.relatedSceneIds ?? [],
	};
}

export function personalHistoryDefaults(source: TimelineEvent | null): PersonalHistoryPayload {
	const base = emptyPersonalHistory();
	if (!source) return base;
	const payload = parseChroniclePayload(source);
	if (payload?.kind === 'personal-history') {
		return {
			...base,
			...payload,
			relatedCharacterIds: payload.relatedCharacterIds ?? source.relatedCharacterIds ?? [],
		};
	}
	return {
		...base,
		title: source.title ?? '',
		timeframe: source.date ?? '',
		formativeEvent: source.description ?? '',
		subjectCharacterId: source.relatedCharacterIds?.[0] ?? '',
		relatedCharacterIds: source.relatedCharacterIds?.slice(1) ?? [],
	};
}

export function isChronicleKind(event: TimelineEvent, kind: ChronicleSystemKind): boolean {
	const payload = parseChroniclePayload(event);
	if (payload) return payload.kind === kind;
	if (event.category === kind) return true;
	// Legacy records (no category, no payload) belong in Eras.
	return kind === 'era' && !event.category;
}

export function chronicleSubtitle(event: TimelineEvent): string {
	const payload = parseChroniclePayload(event);
	if (payload?.kind === 'era') {
		return payload.narrativeSpan?.trim() || payload.eraType || event.date?.trim() || 'Span pending';
	}
	if (payload?.kind === 'key-event') {
		return (
			payload.narrativeDate?.trim() || payload.eventType || event.date?.trim() || 'Date pending'
		);
	}
	if (payload?.kind === 'personal-history') {
		return payload.timeframe?.trim() || payload.historyType || event.date?.trim() || 'Timeframe pending';
	}
	return event.date?.trim() || 'Date pending';
}

export function chronicleMeta(event: TimelineEvent): string {
	const payload = parseChroniclePayload(event);
	if (!payload) return event.description?.trim() ? 'Drafted' : 'Needs context';
	if (payload.kind === 'era') {
		return payload.narrativeFunction?.trim() || payload.endingCondition?.trim() || 'Structured';
	}
	if (payload.kind === 'key-event') {
		return payload.narrativeFunction?.trim() || payload.eventSummary?.trim() || 'Structured';
	}
	return payload.arcImpact?.trim() || payload.presentBehavior?.trim() || 'Structured';
}
