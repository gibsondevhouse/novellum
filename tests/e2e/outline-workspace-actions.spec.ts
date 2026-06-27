import { expect, test, type APIRequestContext } from '@playwright/test';

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Outline Workspace Actions ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A cartographer discovers a city that edits its own map.',
			synopsis: 'The story follows a reluctant archivist through a changing city.',
		},
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function setOnboardingCompleted(request: APIRequestContext): Promise<void> {
	const response = await request.put('/api/db/preferences/app.onboarding.completed', {
		data: { value: true },
	});
	expect(response.ok()).toBe(true);
}

test.describe('outline workspace actions', () => {
	test('surfaces manual creation and AI proposal lanes from the outline route', async ({
		page,
		request,
	}) => {
		await setOnboardingCompleted(request);
		const projectId = await createProject(request);

		try {
			await page.goto(`/projects/${projectId}/outline`);
			await expect(page.getByText('Narrative Structure')).toBeVisible();

			const manualBuilder = page.locator('section[aria-label="Manual outline builder"]');
			await expect(manualBuilder).toBeVisible();
			await expect(manualBuilder.getByRole('heading', { name: 'Start with an arc' })).toBeVisible();
			await expect(page.getByTestId('nova-outline-generation-panel')).toBeVisible();
			await expect(page.getByRole('heading', { name: 'Generate, review, merge' })).toBeVisible();

			await manualBuilder.getByLabel('Title').fill('Opening Throughline');
			await manualBuilder.getByRole('button', { name: 'Create arc' }).click();

			await expect(page.locator('section[data-layer="arc"]')).toContainText('Opening Throughline');
			await expect(manualBuilder.getByRole('heading', { name: 'Add an act' })).toBeVisible();

			await manualBuilder.getByLabel('Title').fill('Act One');
			await manualBuilder.getByRole('button', { name: 'Create act' }).click();

			await expect(page.locator('section[data-layer="act"]')).toContainText('Act One');
			await expect(manualBuilder.getByRole('heading', { name: 'Set an act milestone' })).toBeVisible();
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
