import { expect, test, type APIRequestContext } from '@playwright/test';

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Character Persistence Errors ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A chronicler tests failed character saves.',
			synopsis: 'A dossier update fails but the author still sees the problem.',
		},
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createCharacter(request: APIRequestContext, projectId: string): Promise<string> {
	const response = await request.post('/api/db/characters', {
		data: {
			projectId,
			name: 'Mira Vale',
			role: 'Archivist',
			bio: 'Guards the disputed archive.',
			traits: [],
			goals: [],
			flaws: [],
			arcs: [],
			notes: '',
			tags: [],
		},
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('character persistence errors', () => {
	test('failed autosave shows author-facing error without production console noise', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		await createCharacter(request, projectId);
		const consoleErrors: string[] = [];
		page.on('console', (message) => {
			if (message.type() === 'error') consoleErrors.push(message.text());
		});

		try {
			await page.route('**/api/db/characters/*', async (route) => {
				if (route.request().method() !== 'PUT') {
					await route.continue();
					return;
				}

				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'forced character save failure' }),
				});
			});

			await page.goto(`/projects/${projectId}/world-building/characters/individuals`);
			const nameInput = page.locator('input.entity-name');
			await expect(nameInput).toHaveValue('Mira Vale');

			await nameInput.fill('Mira Vale Updated');
			await expect(page.getByRole('alert')).toHaveText('Could not save character changes.');
			expect(
				consoleErrors.filter((message) => !message.startsWith('Failed to load resource:')),
			).toEqual([]);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
