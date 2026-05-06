// Test stub for SvelteKit's $app/state runtime module.
// Vitest aliases `$app/state` to this file so components can import the
// `page` reactive proxy without requiring SvelteKit's runtime.
// Tests can override fields on `page.url` directly.
export const page = {
	url: new URL('http://localhost/'),
	params: {} as Record<string, string>,
	route: { id: null as string | null },
	status: 200,
	error: null as Error | null,
	data: {} as Record<string, unknown>,
	form: null as unknown,
	state: {} as Record<string, unknown>,
};

export const navigating = null;
export const updated = { current: false, check: async () => false };
