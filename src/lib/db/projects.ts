import { db } from './index.js';

export async function createProject(title = 'Untitled Project'): Promise<string> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	await db.projects.add({
		id,
		title,
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: 'draft',
		createdAt: now,
		updatedAt: now,
	});
	return id;
}
