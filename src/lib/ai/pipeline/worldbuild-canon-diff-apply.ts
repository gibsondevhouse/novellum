import type Database from 'better-sqlite3';
import { encodeJson } from '$lib/server/db/index.js';
import {
	worldbuildCanonDiffSchema,
	type WorldbuildCanonDiff,
	type WorldbuildCanonEntityFamily,
	type WorldbuildCanonFieldDiff,
	type WorldbuildCanonLinkDiff,
	type WorldbuildCanonTargetRef,
} from './worldbuild-canon-diff-schema.js';
import {
	getWorldbuildCanonMergeFieldMode,
	getWorldbuildCanonMergePolicy,
} from './worldbuild-canon-merge-policy.js';
import type { WorldbuildProposalRecord } from './worldbuild-proposal-schema.js';

export interface WorldbuildCanonDiffApplyResult {
	projectionTarget: string;
	projectedToCanon: boolean;
	decision: WorldbuildCanonDiff['decision'];
	targetId: string | null;
}

const FAMILY_TABLES: Partial<Record<WorldbuildCanonEntityFamily, string>> = {
	character: 'characters',
	location: 'locations',
	faction: 'factions',
};

function tableForFamily(family: WorldbuildCanonEntityFamily): string {
	const table = FAMILY_TABLES[family];
	if (!table) {
		throw new Error(`Canon diff family ${family} is not supported for merge application.`);
	}
	return table;
}

function assertSafeField(fieldPath: string): string {
	const field = fieldPath.trim();
	if (!/^[A-Za-z][A-Za-z0-9]*$/.test(field)) {
		throw new Error(`Unsafe or unsupported field path ${fieldPath}.`);
	}
	return field;
}

function loadTargetRow(
	database: Database.Database,
	projectId: string,
	target: WorldbuildCanonTargetRef,
): Record<string, unknown> {
	const table = tableForFamily(target.family);
	const row = database
		.prepare(`SELECT * FROM ${table} WHERE id = ? AND projectId = ?`)
		.get(target.id, projectId) as Record<string, unknown> | undefined;
	if (!row) {
		throw new Error(`Canon diff target ${target.family}:${target.id} was not found.`);
	}
	return row;
}

function isEmptyStoredValue(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed === '' || trimmed === '[]';
	}
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

function stringListFromStored(value: unknown): string[] {
	if (Array.isArray(value)) return normalizeStringList(value);
	if (typeof value !== 'string') return [];
	try {
		const parsed = JSON.parse(value) as unknown;
		if (Array.isArray(parsed)) return normalizeStringList(parsed);
	} catch {
		/* keep plain strings as one-item lists below */
	}
	return value.trim() ? [value.trim()] : [];
}

function normalizeStringList(value: unknown[]): string[] {
	return value
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter(Boolean);
}

function listFromDiffValue(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return normalizeStringList(value);
}

function mergeUniqueStrings(current: string[], next: string[]): string[] {
	const seen = new Set<string>();
	const merged: string[] = [];
	for (const item of [...current, ...next]) {
		const key = item.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(item);
	}
	return merged;
}

function toSqlValue(value: unknown): string | number | null {
	if (value === null || value === undefined) return '';
	if (Array.isArray(value)) return encodeJson(normalizeStringList(value));
	if (typeof value === 'object') return encodeJson(value);
	if (typeof value === 'number') return value;
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return String(value);
}

function resolveFieldValue(row: Record<string, unknown>, family: WorldbuildCanonEntityFamily, field: WorldbuildCanonFieldDiff): string | number | null {
	const fieldPath = assertSafeField(field.fieldPath);
	if (!(fieldPath in row)) {
		throw new Error(`Canon diff field ${fieldPath} does not exist on ${family}.`);
	}

	const mode = getWorldbuildCanonMergeFieldMode(family, fieldPath);
	if (mode === 'never') {
		throw new Error(`Canon diff field ${fieldPath} is protected and cannot be merged.`);
	}

	if (mode === 'replace_if_empty' && !isEmptyStoredValue(row[fieldPath])) {
		throw new Error(`Canon diff field ${fieldPath} already has a value and requires manual review.`);
	}

	if (mode === 'append_unique') {
		const proposedList = listFromDiffValue(field.after);
		if (proposedList.length === 0) {
			throw new Error(`Canon diff field ${fieldPath} requires array values for append.`);
		}
		return encodeJson(mergeUniqueStrings(stringListFromStored(row[fieldPath]), proposedList));
	}

	return toSqlValue(field.after);
}

function applyFieldDiffs(
	database: Database.Database,
	diff: Extract<WorldbuildCanonDiff, { decision: 'update' | 'merge' }>,
	timestamp: string,
): WorldbuildCanonDiffApplyResult {
	const policy = getWorldbuildCanonMergePolicy(diff.family);
	if (!policy?.updateEnabled) {
		throw new Error(`Canon diff family ${diff.family} does not support update application.`);
	}
	if (diff.decision === 'merge' && !policy.mergeEnabled) {
		throw new Error(`Canon diff family ${diff.family} does not support merge application.`);
	}

	const row = loadTargetRow(database, diff.projectId, diff.target);
	const values: Record<string, string | number | null> = {
		id: diff.target.id,
		projectId: diff.projectId,
		updatedAt: timestamp,
	};
	const assignments = ['updatedAt = @updatedAt'];

	for (const field of diff.fields) {
		const fieldPath = assertSafeField(field.fieldPath);
		values[fieldPath] = resolveFieldValue(row, diff.family, field);
		assignments.push(`${fieldPath} = @${fieldPath}`);
	}

	const table = tableForFamily(diff.family);
	database
		.prepare(
			`UPDATE ${table}
			 SET ${assignments.join(', ')}
			 WHERE id = @id AND projectId = @projectId`,
		)
		.run(values);

	return {
		projectionTarget: `${diff.decision}:${diff.family}`,
		projectedToCanon: true,
		decision: diff.decision,
		targetId: diff.target.id,
	};
}

function ensureRefExists(
	database: Database.Database,
	projectId: string,
	target: WorldbuildCanonTargetRef,
): void {
	loadTargetRow(database, projectId, target);
}

function applyFactionMembershipLink(
	database: Database.Database,
	projectId: string,
	link: WorldbuildCanonLinkDiff,
	timestamp: string,
): void {
	if (link.source.family !== 'character' || link.target.family !== 'faction') {
		throw new Error('Faction membership links require a character source and faction target.');
	}
	if (!link.source.id || !link.target.id) {
		throw new Error('Faction membership links require source and target ids.');
	}

	ensureRefExists(database, projectId, {
		...link.target,
		id: link.target.id,
		family: 'faction',
	});
	ensureRefExists(database, projectId, {
		...link.source,
		id: link.source.id,
		family: 'character',
	});

	database
		.prepare(
			`UPDATE characters
			 SET factionId = @factionId, faction = @faction, updatedAt = @updatedAt
			 WHERE id = @characterId AND projectId = @projectId`,
		)
		.run({
			characterId: link.source.id,
			projectId,
			factionId: link.target.id,
			faction: link.target.displayName,
			updatedAt: timestamp,
		});
}

function applyLinkDiffs(
	database: Database.Database,
	diff: Extract<WorldbuildCanonDiff, { decision: 'link' }>,
	timestamp: string,
): WorldbuildCanonDiffApplyResult {
	for (const link of diff.links) {
		if (link.linkType !== 'faction_membership') {
			throw new Error(`Canon link type ${link.linkType} is not supported yet.`);
		}
		applyFactionMembershipLink(database, diff.projectId, link, timestamp);
	}

	return {
		projectionTarget: `${diff.decision}:${diff.family}`,
		projectedToCanon: true,
		decision: diff.decision,
		targetId: diff.target?.id ?? null,
	};
}

export function applyWorldbuildCanonDiff(
	database: Database.Database,
	proposal: WorldbuildProposalRecord,
	timestamp: string,
): WorldbuildCanonDiffApplyResult {
	const parsed = worldbuildCanonDiffSchema.safeParse(proposal.canonDiff);
	if (!parsed.success) {
		throw new Error('Proposal canon diff is malformed and cannot be accepted.');
	}

	const diff = parsed.data;
	if (diff.projectId !== proposal.projectId || diff.proposalId !== proposal.proposalId) {
		throw new Error('Proposal canon diff does not match the proposal identity.');
	}

	if (diff.decision === 'create') {
		throw new Error('Create diffs must use the legacy proposal projection fallback.');
	}
	if (diff.decision === 'update' || diff.decision === 'merge') {
		return applyFieldDiffs(database, diff, timestamp);
	}
	if (diff.decision === 'link') {
		return applyLinkDiffs(database, diff, timestamp);
	}

	return {
		projectionTarget: 'no_op',
		projectedToCanon: false,
		decision: 'no_op',
		targetId: diff.target?.id ?? null,
	};
}
