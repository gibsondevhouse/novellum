import { test, expect, type APIRequestContext } from '@playwright/test';

interface CreatedEntity {
	id: string;
}

interface CharacterRecord {
	id: string;
	name: string;
	role: string;
	bio: string;
	traits: string[];
}

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Story Bible Workspace ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A city keeps a private atlas of impossible places.',
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as CreatedEntity;
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function createCharacter(
	request: APIRequestContext,
	projectId: string,
	name = 'Ari Vale',
): Promise<CreatedEntity> {
	const response = await request.post('/api/db/characters', {
		data: {
			projectId,
			name,
			role: 'Cartographer',
			bio: 'Keeps the impossible maps.',
			traits: ['observant', 'stubborn'],
			goals: ['protect the archive'],
			tags: ['atlas'],
		},
	});
	expect(response.ok()).toBe(true);
	return (await response.json()) as CreatedEntity;
}

async function createLoreEntry(
	request: APIRequestContext,
	projectId: string,
	title: string,
	content: string,
): Promise<CreatedEntity> {
	const response = await request.post('/api/db/lore_entries', {
		data: {
			projectId,
			title,
			category: 'History',
			content,
			tags: ['cross-reference'],
		},
	});
	expect(response.ok()).toBe(true);
	return (await response.json()) as CreatedEntity;
}

test.describe('Story Bible workspace', () => {
	test('creates a character from the workspace form and persists it', async ({ page, request }) => {
		const projectId = await createProject(request);
		try {
			await page.goto(`/projects/${projectId}/story-bible`);

			await expect(page.getByRole('heading', { name: 'Characters' })).toBeVisible();
			await expect(page.getByText('No characters yet.')).toBeVisible();

			await page.getByRole('button', { name: 'New Characters' }).click();
			await page.getByRole('button', { name: 'Create Character' }).click();
			await expect(page.getByText('Name is required.')).toBeVisible();

			await page.locator('#story-bible-character-name').fill('Ari Vale');
			await page.locator('#story-bible-character-role').fill('Cartographer');
			await page.getByLabel('Bio').fill('Keeps the impossible maps.');
			await page.locator('#story-bible-character-traits').fill('observant, stubborn');

			const createResponsePromise = page.waitForResponse(
				(response) =>
					response.url().includes('/api/db/characters') &&
					response.request().method() === 'POST',
			);
			await page.getByRole('button', { name: 'Create Character' }).click();
			const createResponse = await createResponsePromise;
			expect(createResponse.ok()).toBe(true);

			await expect(page.getByRole('button', { name: /Ari Vale/ })).toBeVisible();
			await expect(page.getByRole('button', { name: /^Characters\s+1$/ })).toHaveAttribute(
				'aria-pressed',
				'true',
			);

			const charactersResponse = await request.get(`/api/db/characters?projectId=${projectId}`);
			expect(charactersResponse.ok()).toBe(true);
			const characters = (await charactersResponse.json()) as CharacterRecord[];
			expect(characters).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: 'Ari Vale',
						role: 'Cartographer',
						bio: 'Keeps the impossible maps.',
						traits: ['observant', 'stubborn'],
					}),
				]),
			);
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('navigates resolved dossier links from lore details to the target editor', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			const character = await createCharacter(request, projectId, 'Ari Vale');
			await createLoreEntry(
				request,
				projectId,
				'Treaty of Glass',
				`The compact names @character:${character.id} as the keeper of the map room.`,
			);

			await page.goto(`/projects/${projectId}/story-bible`);
			await page.getByRole('button', { name: /^Lore\s+1$/ }).click();
			await page.getByRole('button', { name: /Treaty of Glass/ }).click();

			const characterLink = page.getByRole('link', { name: 'Ari Vale' });
			await expect(characterLink).toBeVisible();
			await characterLink.click();

			await expect(page.getByRole('button', { name: /^Characters\s+1$/ })).toHaveAttribute(
				'aria-pressed',
				'true',
			);
			await expect(page.locator('#story-bible-character-name')).toHaveValue('Ari Vale');
			await expect(page.getByLabel('Bio')).toHaveValue('Keeps the impossible maps.');
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
