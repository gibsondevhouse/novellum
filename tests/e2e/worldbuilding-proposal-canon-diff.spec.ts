import { test, expect, type APIRequestContext } from '@playwright/test';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

const WORLDBUILD_PROPOSAL_OWNER_ID = 'vibe-worldbuild-scan';

function resolvePreviewDatabasePath(): string {
	if (process.env.NOVELLUM_DB_PATH) return process.env.NOVELLUM_DB_PATH;
	if (process.env.NOVELLUM_APP_DATA_DIR) {
		return join(process.env.NOVELLUM_APP_DATA_DIR, 'novellum.db');
	}
	const home = homedir();
	if (platform() === 'darwin') {
		return join(home, 'Library', 'Application Support', 'Novellum', 'novellum.db');
	}
	if (platform() === 'win32') {
		return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Novellum', 'novellum.db');
	}
	return join(process.env.XDG_DATA_HOME ?? join(home, '.local', 'share'), 'Novellum', 'novellum.db');
}

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function createCharacter(
	request: APIRequestContext,
	projectId: string,
	name: string,
): Promise<string> {
	const response = await request.post('/api/db/characters', {
		data: { projectId, name, traits: ['precise'] },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createLocation(
	request: APIRequestContext,
	projectId: string,
	name: string,
): Promise<string> {
	const response = await request.post('/api/db/locations', {
		data: { projectId, name, tags: ['market'] },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

function sourceContext() {
	return {
		title: 'E2E Canon Diff',
		genre: 'fantasy',
		logline: 'A courier outruns a civil war.',
		synopsisHash: 'e2e12345',
	};
}

function targetRef(
	projectId: string,
	family: 'character' | 'location',
	id: string,
	displayName: string,
) {
	return {
		family,
		id,
		displayName,
		table: family === 'character' ? 'characters' : 'locations',
		projectId,
	};
}

function seedProposal(
	projectId: string,
	proposal: Record<string, unknown>,
): void {
	const database = new Database(resolvePreviewDatabasePath(), { timeout: 5000 });
	try {
		database.pragma('busy_timeout = 5000');
		database.pragma('foreign_keys = ON');
		database
			.prepare(
				`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
				 VALUES (@projectId, 'pipeline', @ownerId, @key, @value, @updatedAt)`,
			)
			.run({
				projectId,
				ownerId: WORLDBUILD_PROPOSAL_OWNER_ID,
				key: proposal.proposalId,
				value: JSON.stringify(proposal),
				updatedAt: new Date().toISOString(),
			});
	} finally {
		database.close();
	}
}

function makeProposal(input: {
	projectId: string;
	categoryId?: string;
	entityKind?: string;
	payload?: Record<string, unknown>;
	canonDiff?: Record<string, unknown>;
}): Record<string, unknown> {
	const proposalId = randomUUID();
	const categoryId = input.categoryId ?? 'personae';
	const entityKind = input.entityKind ?? 'character';
	return {
		proposalId,
		projectId: input.projectId,
		categoryId,
		entityKind,
		status: 'pending_review',
		generatedAt: new Date().toISOString(),
		sourceContext: sourceContext(),
		confidence: 0.88,
		reasoningSummary: 'E2E proposal.',
		payload: input.payload ?? { name: 'Ari Quill', role: 'courier' },
		dedupeKey: `${categoryId}:${entityKind}:${proposalId}`,
		canonDiff: input.canonDiff ?? null,
		duplicateCandidates: [],
		acceptance: null,
		rejection: null,
	};
}

async function acceptProposal(
	request: APIRequestContext,
	projectId: string,
	proposalId: string,
): Promise<Record<string, unknown>> {
	const response = await request.post(`/api/worldbuilding/proposals/${proposalId}/accept`, {
		data: { projectId },
	});
	expect(response.ok(), `accept proposal failed: ${response.status()}`).toBe(true);
	return (await response.json()) as Record<string, unknown>;
}

async function rejectProposal(
	request: APIRequestContext,
	projectId: string,
	proposalId: string,
	reason: string,
): Promise<Record<string, unknown>> {
	const response = await request.post(`/api/worldbuilding/proposals/${proposalId}/reject`, {
		data: { projectId, reason },
	});
	expect(response.ok(), `reject proposal failed: ${response.status()}`).toBe(true);
	return (await response.json()) as Record<string, unknown>;
}

test.describe('worldbuilding proposal canon diff flow', () => {
	test('accepts create, update, and merge proposal decisions through proposal routes', async ({
		request,
	}) => {
		const projectId = await createProject(request, `E2E Proposal Diff ${Date.now()}`);
		try {
			const createDiffId = randomUUID();
			const createProposal = makeProposal({
				projectId,
				canonDiff: {
					diffId: createDiffId,
					proposalId: '',
					projectId,
					categoryId: 'personae',
					entityKind: 'character',
					family: 'character',
					generatedAt: new Date().toISOString(),
					summary: 'Create Ari Quill.',
					confidence: 0.88,
					decision: 'create',
					target: null,
					fields: [
						{
							fieldPath: 'name',
							valueType: 'string',
							operation: 'add',
							before: null,
							after: 'Ari Quill',
							evidence: [],
						},
					],
					links: [],
					duplicateCandidates: [],
					evidence: [],
				},
			});
			(createProposal.canonDiff as Record<string, unknown>).proposalId = createProposal.proposalId;
			seedProposal(projectId, createProposal);

			const createAccepted = await acceptProposal(request, projectId, String(createProposal.proposalId));
			expect(createAccepted).toMatchObject({
				ok: true,
				proposal: {
					status: 'accepted',
					acceptance: {
						projectedToCanon: true,
						audit: {
							projectionMode: 'legacy_create_projection',
							decision: 'create',
							diffId: createDiffId,
						},
					},
				},
			});

			const characterId = await createCharacter(request, projectId, 'Mira Vale');
			const updateDiff = {
				diffId: randomUUID(),
				proposalId: '',
				projectId,
				categoryId: 'personae',
				entityKind: 'character',
				family: 'character',
				generatedAt: new Date().toISOString(),
				summary: 'Fill Mira canon fields.',
				confidence: 0.9,
				decision: 'update',
				target: targetRef(projectId, 'character', characterId, 'Mira Vale'),
				fields: [
					{
						fieldPath: 'coreDesire',
						valueType: 'string',
						operation: 'add',
						before: '',
						after: 'Recover the ledger.',
						evidence: [{ kind: 'empty_field', label: 'Core desire is empty.', score: 1 }],
					},
					{
						fieldPath: 'traits',
						valueType: 'array',
						operation: 'append',
						before: ['precise'],
						after: ['restless'],
						evidence: [],
					},
				],
				links: [],
				duplicateCandidates: [],
				evidence: [],
			};
			const updateProposal = makeProposal({
				projectId,
				payload: { name: 'Mira Vale' },
				canonDiff: updateDiff,
			});
			updateDiff.proposalId = String(updateProposal.proposalId);
			seedProposal(projectId, updateProposal);

			const updateAccepted = await acceptProposal(request, projectId, String(updateProposal.proposalId));
			expect(updateAccepted).toMatchObject({
				ok: true,
				proposal: {
					status: 'accepted',
					acceptance: {
						audit: {
							projectionMode: 'canon_diff',
							decision: 'update',
							targetId: characterId,
						},
					},
				},
			});

			const locationId = await createLocation(request, projectId, 'Glass Delta');
			const mergeDiff = {
				diffId: randomUUID(),
				proposalId: '',
				projectId,
				categoryId: 'atlas',
				entityKind: 'location',
				family: 'location',
				generatedAt: new Date().toISOString(),
				summary: 'Merge location details.',
				confidence: 0.91,
				decision: 'merge',
				target: targetRef(projectId, 'location', locationId, 'Glass Delta'),
				fields: [
					{
						fieldPath: 'description',
						valueType: 'string',
						operation: 'add',
						before: '',
						after: 'A flooded market crossing.',
						evidence: [],
					},
					{
						fieldPath: 'tags',
						valueType: 'array',
						operation: 'append',
						before: ['market'],
						after: ['flooded'],
						evidence: [],
					},
				],
				links: [],
				duplicateCandidates: [
					{
						target: targetRef(projectId, 'location', locationId, 'Glass Delta'),
						matchKind: 'exact_name',
						score: 1,
						evidence: [{ kind: 'exact_name', label: 'Exact location name.', score: 1 }],
					},
				],
				evidence: [],
			};
			const mergeProposal = makeProposal({
				projectId,
				categoryId: 'atlas',
				entityKind: 'location',
				payload: { name: 'Glass Delta' },
				canonDiff: mergeDiff,
			});
			mergeDiff.proposalId = String(mergeProposal.proposalId);
			seedProposal(projectId, mergeProposal);

			const mergeAccepted = await acceptProposal(request, projectId, String(mergeProposal.proposalId));
			expect(mergeAccepted).toMatchObject({
				ok: true,
				proposal: {
					status: 'accepted',
					acceptance: {
						audit: {
							projectionMode: 'canon_diff',
							decision: 'merge',
							targetId: locationId,
							duplicateCandidateCount: 1,
						},
					},
				},
			});

			const characters = (await (
				await request.get(`/api/db/characters?projectId=${projectId}`)
			).json()) as Array<{ id: string; name: string; coreDesire: string; traits: string[] }>;
			const mira = characters.find((character) => character.id === characterId);
			expect(mira).toMatchObject({
				name: 'Mira Vale',
				coreDesire: 'Recover the ledger.',
				traits: ['precise', 'restless'],
			});
			expect(characters.some((character) => character.name === 'Ari Quill')).toBe(true);

			const locations = (await (
				await request.get(`/api/db/locations?projectId=${projectId}`)
			).json()) as Array<{ id: string; description: string; tags: string[] }>;
			const glassDelta = locations.find((location) => location.id === locationId);
			expect(glassDelta).toMatchObject({
				description: 'A flooded market crossing.',
				tags: ['market', 'flooded'],
			});
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('rejects diff proposals with reason and leaves canon unchanged', async ({ request }) => {
		const projectId = await createProject(request, `E2E Proposal Reject ${Date.now()}`);
		try {
			const characterId = await createCharacter(request, projectId, 'Sel Rune');
			const diff = {
				diffId: randomUUID(),
				proposalId: '',
				projectId,
				categoryId: 'personae',
				entityKind: 'character',
				family: 'character',
				generatedAt: new Date().toISOString(),
				summary: 'Merge rejected character detail.',
				confidence: 0.87,
				decision: 'merge',
				target: targetRef(projectId, 'character', characterId, 'Sel Rune'),
				fields: [
					{
						fieldPath: 'coreDesire',
						valueType: 'string',
						operation: 'add',
						before: '',
						after: 'Seize the archive.',
						evidence: [],
					},
				],
				links: [],
				duplicateCandidates: [
					{
						target: targetRef(projectId, 'character', characterId, 'Sel Rune'),
						matchKind: 'exact_name',
						score: 1,
						evidence: [{ kind: 'exact_name', label: 'Exact character name.', score: 1 }],
					},
				],
				evidence: [],
			};
			const proposal = makeProposal({
				projectId,
				payload: { name: 'Sel Rune' },
				canonDiff: diff,
			});
			diff.proposalId = String(proposal.proposalId);
			seedProposal(projectId, proposal);

			const rejected = await rejectProposal(
				request,
				projectId,
				String(proposal.proposalId),
				'Conflicts with established canon.',
			);
			expect(rejected).toMatchObject({
				ok: true,
				proposal: {
					status: 'rejected',
					rejection: {
						reason: 'Conflicts with established canon.',
						audit: {
							decision: 'merge',
							targetId: characterId,
							duplicateCandidateCount: 1,
						},
					},
				},
			});

			const characters = (await (
				await request.get(`/api/db/characters?projectId=${projectId}`)
			).json()) as Array<{ id: string; coreDesire: string; traits: string[] }>;
			const sel = characters.find((character) => character.id === characterId);
			expect(sel).toMatchObject({
				coreDesire: '',
				traits: ['precise'],
			});
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
