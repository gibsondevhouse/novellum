import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const PUT: RequestHandler = async ({ request }) => {
	const { orderedIds } = await request.json();
	if (!Array.isArray(orderedIds)) {
		return json({ error: 'orderedIds array required' }, { status: 400 });
	}

	const stmt = db.prepare(`UPDATE stages SET "order" = @order, updatedAt = @updatedAt WHERE id = @id`);
	const now = new Date().toISOString();

	db.transaction(() => {
		for (let i = 0; i < orderedIds.length; i++) {
			stmt.run({ id: orderedIds[i], order: i, updatedAt: now });
		}
	})();

	return json({ success: true });
};
