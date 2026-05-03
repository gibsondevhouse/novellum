import type { Location } from '$lib/db/domain-types';

export const REALM_TYPE_OPTIONS = [
	{ value: 'physical', label: 'Physical' },
	{ value: 'metaphysical', label: 'Metaphysical' },
	{ value: 'political', label: 'Political' },
	{ value: 'hybrid', label: 'Hybrid' },
] as const;

export const LANDMARK_ACTIVITY_OPTIONS = [
	'Conflict',
	'Planning',
	'Intimacy',
	'Ritual',
	'Revelation',
	'Negotiation',
	'Flight',
	'Reckoning',
] as const;

export function isLandmarkLocation(location: Location): boolean {
	return location.kind === 'landmark';
}

export function isRealmLocation(location: Location): boolean {
	return location.kind !== 'landmark';
}

export function formatRealmMeta(location: Location): string {
	const type = location.realmType?.trim();
	const tone = location.tone?.trim();
	if (type && tone) return `${type} • ${tone}`;
	if (type) return type;
	if (tone) return tone;
	return 'Narrative environment';
}

export function formatLandmarkMeta(location: Location, realms: Location[]): string {
	const parentRealm = realms.find((realm) => realm.id === location.realmId);
	const activity = location.activityType?.trim();
	if (parentRealm && activity) return `${parentRealm.name} • ${activity}`;
	if (parentRealm) return parentRealm.name;
	if (activity) return activity;
	return 'Scene location';
}

export function formatLocationSubtitle(location: Location, fallback: string): string {
	const values = [
		location.conflictPressure,
		location.storyRole,
		location.environment,
		location.purpose,
		location.description,
	]
		.map((value) => value?.trim() ?? '')
		.filter(Boolean);

	return values[0] ?? fallback;
}

export function splitCommaSeparated(value: string): string[] {
	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

export function joinCommaSeparated(values: string[] | undefined): string {
	return (values ?? []).join(', ');
}