import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const PUT: RequestHandler = async ({ request }) => {
	const { orderedIds } = await request.json();
	if (!Array.isArray(orderedIds)) {
		return json({ error: 'orderedIds required' }, { status: 400 });
	}

	const updateOrder = db.prepare('UPDATE scenes SET "order" = ?, updatedAt = ? WHERE id = ?');
	const now = new Date().toISOString();
	db.transaction(() => {
		for (let i = 0; i < orderedIds.length; i++) {
			updateOrder.run(i, now, orderedIds[i]);
		}
	})();

	return json({ ok: true });
};
