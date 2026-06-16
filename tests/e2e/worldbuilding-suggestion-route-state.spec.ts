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

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: { title: `Worldbuilding Suggestion Route ${Date.now()}` },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

function seedProposal(projectId: string): void {
	const proposalId = randomUUID();
	const generatedAt = new Date().toISOString();
	const proposal = {
		proposalId,
		projectId,
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt,
		sourceContext: {
			title: 'E2E Suggestion Route',
			genre: 'fantasy',
			logline: 'A courier finds a hidden dynasty.',
			synopsisHash: 'route-state-e2e',
		},
		confidence: 0.84,
		reasoningSummary: 'Adds a visible pending worldbuilding suggestion.',
		payload: { name: 'Iren Voss' },
		dedupeKey: `personae:character:${proposalId}`,
		acceptance: null,
		rejection: null,
	};

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
				key: proposalId,
				value: JSON.stringify(proposal),
				updatedAt: generatedAt,
			});
	} finally {
		database.close();
	}
}

test.describe('worldbuilding suggestion route state', () => {
	test('shows persisted pending proposals on the help route', async ({ page, request }) => {
		const projectId = await createProject(request);
		try {
			seedProposal(projectId);

			await page.goto(`/projects/${projectId}/world-building/help`);

			await expect(page.getByLabel('Worldbuilding proposal review state')).toContainText(
				'1 suggestion pending review',
			);
			await expect(page.getByLabel('1 pending suggestion for Personae')).toBeVisible();
			await expect(page.getByText('Pending suggestions')).toBeVisible();
			await expect(
				page.getByRole('heading', { name: 'Suggested worldbuilding changes' }),
			).toBeVisible();
			const reviewSection = page.locator(
				'section[aria-labelledby="worldbuilding-proposal-review-title"]',
			);
			await expect(reviewSection.getByRole('heading', { name: 'Personae' })).toBeVisible();
			await expect(reviewSection.getByText('Iren Voss')).toBeVisible();

			await page.setViewportSize({ width: 390, height: 844 });
			const mobileBadge = page.getByLabel('1 pending suggestion for Personae');
			await expect(mobileBadge).toBeVisible();
			const badgeBox = await mobileBadge.boundingBox();
			expect(badgeBox).not.toBeNull();
			expect((badgeBox?.x ?? 0) + (badgeBox?.width ?? 0)).toBeLessThanOrEqual(390);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
