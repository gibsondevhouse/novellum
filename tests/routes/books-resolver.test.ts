import { beforeEach, describe, expect, it, vi } from 'vitest';

const resolveLastReadBookId = vi.fn();

vi.mock('$lib/navigation-state.js', () => ({
	resolveLastReadBookId: (...args: unknown[]) => resolveLastReadBookId(...args),
}));

async function loadRoute() {
	return await import('../../src/routes/books/+page.js');
}

function expectRedirect(error: unknown, status: number, location: string) {
	const err = error as { status?: number; location?: string };
	expect(err.status).toBe(status);
	expect(err.location).toBe(location);
}

describe('/books resolver route', () => {
	beforeEach(() => {
		resolveLastReadBookId.mockReset();
		vi.resetModules();
	});

	it('redirects /books?create=1 to /projects?create=1', async () => {
		const mod = await loadRoute();
		type LoadFn = (event: { url: URL }) => Promise<unknown>;

		try {
			await (mod.load as unknown as LoadFn)({
				url: new URL('http://localhost/books?create=1'),
			});
			throw new Error('expected redirect');
		} catch (error) {
			expectRedirect(error, 307, '/projects?create=1');
			expect(resolveLastReadBookId).not.toHaveBeenCalled();
		}
	});

	it('redirects to /books/:id when last-read id is valid', async () => {
		resolveLastReadBookId.mockResolvedValue({ id: 'book-123', status: 'valid' });
		const mod = await loadRoute();
		type LoadFn = (event: { url: URL }) => Promise<unknown>;

		try {
			await (mod.load as unknown as LoadFn)({
				url: new URL('http://localhost/books'),
			});
			throw new Error('expected redirect');
		} catch (error) {
			expectRedirect(error, 307, '/books/book-123');
		}
	});

	it('redirects to /projects when no valid last-read id exists', async () => {
		resolveLastReadBookId.mockResolvedValue({ id: null, status: 'empty' });
		const mod = await loadRoute();
		type LoadFn = (event: { url: URL }) => Promise<unknown>;

		try {
			await (mod.load as unknown as LoadFn)({
				url: new URL('http://localhost/books'),
			});
			throw new Error('expected redirect');
		} catch (error) {
			expectRedirect(error, 307, '/projects');
		}
	});
});
