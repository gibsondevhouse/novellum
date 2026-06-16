import { test, expect, type APIRequestContext } from '@playwright/test';

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Worldbuilding Generation Actions ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A cartographer discovers a border that should not exist.',
			synopsis: 'A city-state loses its maps on the eve of succession.',
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('worldbuilding generation actions', () => {
	test('main landing generate opens draft review and resets after discard', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			let generationRequestCount = 0;
			await page.route('**/api/worldbuilding/generate', async (route) => {
				generationRequestCount += 1;
				const requestBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
				expect(requestBody).toMatchObject({
					projectId,
					entityKind: 'character',
					count: 3,
				});
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						drafts: [{ name: 'Main Route Character', role: 'Guide', bio: 'Knows the old road.' }],
						entityKind: 'character',
						projectContext: {
							title: 'Worldbuilding Generation Actions',
							genre: 'fantasy',
							logline: 'A cartographer discovers a border that should not exist.',
						},
					}),
				});
			});

			await page.goto(`/projects/${projectId}/world-building`);

			const personaeTile = page.locator('article#personae');
			const generateButton = personaeTile.getByRole('button', { name: 'Generate Personae' });

			await generateButton.click();
			await expect(page.getByRole('dialog', { name: 'Generate Character' })).toBeVisible();
			await expect(personaeTile.getByRole('button', { name: 'Review draft' })).toBeVisible();
			await expect(generateButton).toBeDisabled();
			expect(generationRequestCount).toBe(1);

			await page.getByRole('button', { name: 'Discard all' }).click();

			await expect(page.getByRole('dialog', { name: 'Generate Character' })).toBeHidden();
			await expect(personaeTile.getByRole('button', { name: 'Generate Personae' })).toBeEnabled();
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('help route generate calls the real generation route and reaches pending review', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			let generationRequestCount = 0;
			await page.route('**/api/worldbuilding/generate', async (route) => {
				generationRequestCount += 1;
				const requestBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
				expect(requestBody).toMatchObject({
					projectId,
					entityKind: 'character',
					count: 3,
				});
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						drafts: [{ name: 'Mock Character 1', role: 'Guide', bio: 'Knows the old road.' }],
						entityKind: 'character',
						projectContext: {
							title: 'Worldbuilding Generation Actions',
							genre: 'fantasy',
							logline: 'A cartographer discovers a border that should not exist.',
						},
					}),
				});
			});

			await page.goto(`/projects/${projectId}/world-building/help`);

			const responsePromise = page.waitForResponse(
				(response) =>
					response.url().includes('/api/worldbuilding/generate') &&
					response.request().method() === 'POST',
			);

			await page.locator('article#personae').getByRole('button', { name: 'Generate Personae' }).click();
			const response = await responsePromise;
			expect(response.ok()).toBe(true);
			expect(generationRequestCount).toBe(1);
			await expect(page.getByText('Pending review')).toBeVisible();
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('help route blocked domain shows dependency copy without generation request', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			let generationRequestCount = 0;
			await page.route('**/api/worldbuilding/generate', async (route) => {
				generationRequestCount += 1;
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'blocked domain should not generate' }),
				});
			});

			await page.goto(`/projects/${projectId}/world-building/help`);

			const atlasTile = page.locator('article#atlas');
			const atlasGenerate = atlasTile.getByRole('button', { name: /Generate Atlas: Requires Personae/ });

			await expect(atlasGenerate).toBeDisabled();
			await expect(atlasTile.getByRole('status').getByText('Requires Personae')).toBeVisible();
			expect(generationRequestCount).toBe(0);
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('failed landing generation shows retry copy and retries only after user action', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			let generationRequestCount = 0;
			await page.route('**/api/worldbuilding/generate', async (route) => {
				generationRequestCount += 1;
				if (generationRequestCount === 1) {
					await route.fulfill({
						status: 502,
						contentType: 'application/json',
						body: JSON.stringify({
							error: {
								code: 'validation_failed',
								message: 'validation_failed: missing name',
							},
						}),
					});
					return;
				}

				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						drafts: [{ name: 'Retry Character', role: 'Witness', bio: 'Saw the old map.' }],
						entityKind: 'character',
						projectContext: {
							title: 'Worldbuilding Generation Actions',
							genre: 'fantasy',
							logline: 'A cartographer discovers a border that should not exist.',
						},
					}),
				});
			});

			await page.goto(`/projects/${projectId}/world-building/help`);

			const personaeTile = page.locator('article#personae');
			await personaeTile.getByRole('button', { name: 'Generate Personae' }).click();
			await expect(
				personaeTile.getByText('The generated draft could not be validated. Try again.'),
			).toBeVisible();
			expect(generationRequestCount).toBe(1);

			await personaeTile.getByRole('button', { name: 'Retry' }).click();
			await expect(personaeTile.getByText('Pending review')).toBeVisible();
			expect(generationRequestCount).toBe(2);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
