import type { RequestHandler } from './$types';
import { readWorkspaceImage } from '$modules/bible/services/character-dossier-files.js';

export const GET: RequestHandler = async ({ url }) => {
	const filePath = url.searchParams.get('path');
	if (!filePath) {
		return new Response('Missing image path.', { status: 400 });
	}

	try {
		const image = await readWorkspaceImage(filePath);
		const body = image.buffer.buffer.slice(
			image.buffer.byteOffset,
			image.buffer.byteOffset + image.buffer.byteLength,
		) as ArrayBuffer;
		return new Response(body, {
			headers: {
				'Content-Type': image.mimeType,
				'Cache-Control': 'no-store',
				'X-Novellum-Relative-Path': image.relativePath,
			},
		});
	} catch (error) {
		return new Response(error instanceof Error ? error.message : 'Image unavailable.', {
			status: 400,
		});
	}
};