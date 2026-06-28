import { expect, test, type APIRequestContext } from '@playwright/test';

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Brainstorm Prefill ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A court redraws its coastline whenever the monarch lies.',
			synopsis: 'A royal mapmaker discovers that every political falsehood changes the realm.',
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

test.describe('brainstorm worldbuilding prefill', () => {
	test.setTimeout(60_000);

	test('accepts a brainstorm location seed and sends it as worldbuilding generation context', async ({
		page,
		request,
	}) => {
		const projectId = await createProject(request);
		try {
			await page.route('**/api/settings/ai-status?**', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ configured: true, providerId: 'openrouter' }),
				});
			});

			await page.route('**/api/ai/brainstorm/generate', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						session: {
							schemaVersion: '1.0.0',
							seedIdea: 'A lying court redraws maps.',
							proposals: {
								premiseVariants: [
									{
										id: 'false-coast',
										category: 'premise_variant',
										title: 'False Coast',
										description: 'A coastline that shifts whenever a ruler lies.',
										rationale: 'Turns political deception into a visible geographic pressure.',
										worldbuildSeedTarget: 'location_seed',
										storyQuestion: 'Who benefits when the map changes overnight?',
									},
								],
								thematicThreads: [],
								genreHooks: [],
								protagonistSketches: [],
							},
						},
					}),
				});
			});

			let generationContext: unknown;
			await page.route('**/api/worldbuilding/generate', async (route) => {
				const requestBody = JSON.parse(route.request().postData() ?? '{}') as Record<
					string,
					unknown
				>;
				generationContext = requestBody.generationContext;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						drafts: [{ name: 'False Coast', summary: 'A mutable shoreline.' }],
						entityKind: 'realm',
						projectContext: { title: 'Brainstorm Prefill', genre: 'fantasy' },
					}),
				});
			});

			await page.goto(`/projects/${projectId}/world-building`);
			await page.getByRole('button', { name: 'Show Copilot' }).click();
			await expect(page.getByRole('complementary', { name: 'Nova panel' })).toBeVisible();

			await page.getByTestId('nova-brainstorm-seed').fill('A lying court redraws maps.');
			await page.getByTestId('nova-brainstorm-generate').click();
			await expect(page.getByTestId('nova-brainstorm-proposals')).toBeVisible();
			await expect(page.getByText('False Coast')).toBeVisible();

			const acceptButton = page.getByTestId('nova-brainstorm-accept').first();
			await acceptButton.scrollIntoViewIfNeeded();
			await expect(acceptButton).toBeVisible();
			await acceptButton.click();
			await expect(page.getByTestId('nova-brainstorm-staging-count')).toContainText('1 accepted');

			await page.getByRole('button', { name: 'Hide Copilot' }).click();
			await page.getByRole('link', { name: 'Open Atlas' }).click();
			await page.waitForURL(new RegExp(`/projects/${projectId}/world-building/locations$`));
			await page.getByRole('link', { name: 'Realms' }).click();
			await page.waitForURL(new RegExp(`/projects/${projectId}/world-building/locations/realms$`));
			await page.getByRole('button', { name: 'Generate realm suggestions' }).first().click();
			await expect(page.getByTestId('worldbuild-brainstorm-prefill')).toBeVisible();
			await expect(page.getByText('Accepted Brainstorm seeds')).toBeVisible();
			await expect(
				page.getByTestId('worldbuild-brainstorm-prefill').getByText('False Coast'),
			).toBeVisible();

			await page.getByTestId('worldbuild-pregen-generate').click();
			await expect
				.poll(() => generationContext)
				.toMatchObject({
					note: expect.stringContaining('False Coast'),
					hints: [
						{
							name: 'False Coast',
							intent: 'target',
							source: 'brainstorm',
						},
					],
				});
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
