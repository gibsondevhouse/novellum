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

function makeProposal(projectId: string, name: string): Record<string, unknown> {
	const proposalId = randomUUID();
	return {
		proposalId,
		projectId,
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: new Date().toISOString(),
		sourceContext: {
			title: 'E2E Review Actions',
			genre: 'fantasy',
			logline: 'A courier discovers an erased inheritance.',
			synopsisHash: 'review-actions',
		},
		confidence: 0.86,
		reasoningSummary: `Adds ${name} as a reviewable character suggestion.`,
		payload: { name, role: 'Cartographer' },
		dedupeKey: `personae:character:${proposalId}`,
		acceptance: null,
		rejection: null,
	};
}

function seedProposal(projectId: string, proposal: Record<string, unknown>): void {
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

test.describe('worldbuilding proposal review actions', () => {
	test('accepts a surfaced persisted proposal and relabels it as reviewed', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request, `Worldbuilding Proposal Accept ${Date.now()}`);
		try {
			const proposal = makeProposal(projectId, 'Iren Voss');
			seedProposal(projectId, proposal);

			await page.goto(`/projects/${projectId}/world-building/help`);
			const reviewSection = page.locator(
				'section[aria-labelledby="worldbuilding-proposal-review-title"]',
			);

			await expect(reviewSection.getByText('Iren Voss', { exact: true })).toBeVisible();
			await reviewSection.getByRole('button', { name: /Accept proposal/i }).click();

			await expect(reviewSection.getByRole('status')).toContainText(
				'Suggestion accepted and projected to canon.',
			);
			await expect(reviewSection.getByText('Accepted', { exact: true })).toBeVisible();
			await expect(page.getByLabel('Worldbuilding proposal review state')).toHaveCount(0);
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('rejects a surfaced persisted proposal and keeps the rejection reason visible', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request, `Worldbuilding Proposal Reject ${Date.now()}`);
		try {
			const proposal = makeProposal(projectId, 'Tamsin Rook');
			seedProposal(projectId, proposal);

			await page.goto(`/projects/${projectId}/world-building/help`);
			const reviewSection = page.locator(
				'section[aria-labelledby="worldbuilding-proposal-review-title"]',
			);

			await expect(reviewSection.getByText('Tamsin Rook', { exact: true })).toBeVisible();
			await reviewSection.getByRole('button', { name: /Reject proposal/i }).click();
			await reviewSection.getByLabel('Rejection reason').fill('Not for this draft.');
			await reviewSection.getByRole('button', { name: 'Confirm reject' }).click();

			await expect(reviewSection.getByRole('status')).toContainText('Suggestion rejected.');
			await expect(reviewSection.getByText('Rejected: Not for this draft.')).toBeVisible();
			await expect(page.getByLabel('Worldbuilding proposal review state')).toHaveCount(0);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
