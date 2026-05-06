import { describe, it, expect, beforeEach, vi } from 'vitest';

const getServerPreference = vi.fn();
const dbGet = vi.fn();
const prepare = vi.fn(() => ({ get: dbGet }));

vi.mock('$lib/server/db/index.js', () => ({
	db: { prepare },
}));

vi.mock('$lib/server/preferences/preferences-service.js', () => ({
	getPreference: (...args: unknown[]) => getServerPreference(...args),
}));

vi.mock('$app/environment', () => ({ dev: false }));

beforeEach(() => {
	getServerPreference.mockReset();
	dbGet.mockReset();
	prepare.mockClear();
	vi.resetModules();
});

async function loadServer() {
	return await import('../../src/routes/+page.server.js');
}

async function callLoad() {
	const mod = await loadServer();
	type LoadFn = (event: unknown) => Promise<unknown>;
	return await (mod.load as unknown as LoadFn)({});
}

function expectRedirect(err: unknown, status: number, location: string) {
	const e = err as { status?: number; location?: string };
	expect(e.status).toBe(status);
	expect(e.location).toBe(location);
}

describe('+page.server.ts (root) — Default Home Page redirect', () => {
	it('returns {} when the preference is missing (default = library)', async () => {
		getServerPreference.mockReturnValue(undefined);
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("returns {} when preference is 'library'", async () => {
		getServerPreference.mockImplementation((key: string) =>
			key === 'app.defaults.homePage' ? 'library' : undefined,
		);
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("redirects to /books/<id> when 'last-read' resolves a lastBookId", async () => {
		getServerPreference.mockImplementation((key: string) => {
			if (key === 'app.defaults.homePage') return 'last-read';
			if (key === 'app.readerMode')
				return { mode: 'classic', lastBookId: 'book-123', pageIndex: {} };
			return undefined;
		});

		try {
			await callLoad();
			throw new Error('expected redirect');
		} catch (err) {
			expectRedirect(err, 307, '/books/book-123');
		}
	});

	it("returns {} when 'last-read' has no lastBookId", async () => {
		getServerPreference.mockImplementation((key: string) => {
			if (key === 'app.defaults.homePage') return 'last-read';
			if (key === 'app.readerMode')
				return { mode: 'classic', lastBookId: null, pageIndex: {} };
			return undefined;
		});
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("returns {} when 'last-read' payload is missing entirely", async () => {
		getServerPreference.mockImplementation((key: string) => {
			if (key === 'app.defaults.homePage') return 'last-read';
			return undefined;
		});
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("returns {} when 'last-read' lookup throws", async () => {
		getServerPreference.mockImplementation((key: string) => {
			if (key === 'app.defaults.homePage') return 'last-read';
			throw new Error('boom');
		});
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("redirects to /projects/<id> when 'last-project' resolves a row", async () => {
		getServerPreference.mockImplementation((key: string) =>
			key === 'app.defaults.homePage' ? 'last-project' : undefined,
		);
		dbGet.mockReturnValue({ id: 'proj-42' });

		try {
			await callLoad();
			throw new Error('expected redirect');
		} catch (err) {
			expectRedirect(err, 307, '/projects/proj-42');
			expect(prepare).toHaveBeenCalledWith(
				"SELECT id FROM projects WHERE lastOpenedAt != '' ORDER BY lastOpenedAt DESC LIMIT 1",
			);
		}
	});

	it("returns {} when 'last-project' yields no row", async () => {
		getServerPreference.mockImplementation((key: string) =>
			key === 'app.defaults.homePage' ? 'last-project' : undefined,
		);
		dbGet.mockReturnValue(undefined);
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it("returns {} when 'last-project' DB lookup throws", async () => {
		getServerPreference.mockImplementation((key: string) =>
			key === 'app.defaults.homePage' ? 'last-project' : undefined,
		);
		dbGet.mockImplementation(() => {
			throw new Error('db down');
		});
		const out = await callLoad();
		expect(out).toEqual({});
	});

	it('treats malformed preference values as the library default', async () => {
		getServerPreference.mockReturnValue('garbage');
		const out = await callLoad();
		expect(out).toEqual({});
	});
});
