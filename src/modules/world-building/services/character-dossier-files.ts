import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveAppDataDir } from '$lib/server/app-data/path.js';

/**
 * Root for dossier assets (character scratchpads + per-project images).
 *
 * Resolved at module load via `resolveAppDataDir()` so packaged Tauri
 * builds, where `process.cwd()` is wherever the OS launched Node from
 * (often the user's home), still land under the OS-conventional app
 * data directory. In dev this is `~/.novellum`; in tests it's a temp
 * dir under `os.tmpdir()`; in the packaged app it's
 * `~/Library/Application Support/Novellum` (or platform equivalent).
 *
 * The relative paths returned to callers are still stable within a
 * given environment, so DB rows that reference scratchpad/image paths
 * keep resolving across restarts in the same install.
 */
const WORKSPACE_ROOT = resolveAppDataDir();
const SCRATCHPAD_ROOT = path.join(WORKSPACE_ROOT, 'scratchpads', 'characters');
const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

function resolveWorkspacePath(filePath: string): string {
	const normalized = filePath.trim().replace(/^\.\//, '');
	const absolute = path.resolve(WORKSPACE_ROOT, normalized);
	const relative = path.relative(WORKSPACE_ROOT, absolute);

	if (!normalized || relative.startsWith('..') || path.isAbsolute(relative)) {
		throw new Error('Path must stay within the workspace root.');
	}

	return absolute;
}

export function normalizeWorkspaceRelativePath(filePath: string): string {
	const absolute = resolveWorkspacePath(filePath);
	return path.relative(WORKSPACE_ROOT, absolute).split(path.sep).join('/');
}

export async function readCharacterScratchpad(projectId: string, characterId: string): Promise<{
	content: string;
	path: string;
}> {
	const absolutePath = path.join(SCRATCHPAD_ROOT, projectId, `${characterId}.md`);
	const relativePath = path.relative(WORKSPACE_ROOT, absolutePath).split(path.sep).join('/');

	try {
		const content = await readFile(absolutePath, 'utf8');
		return { content, path: relativePath };
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		return { content: '', path: relativePath };
	}
}

export async function writeCharacterScratchpad(
	projectId: string,
	characterId: string,
	content: string,
): Promise<{ path: string }> {
	const directoryPath = path.join(SCRATCHPAD_ROOT, projectId);
	const absolutePath = path.join(directoryPath, `${characterId}.md`);
	await mkdir(directoryPath, { recursive: true });
	await writeFile(absolutePath, content, 'utf8');
	return {
		path: path.relative(WORKSPACE_ROOT, absolutePath).split(path.sep).join('/'),
	};
}

export async function readWorkspaceImage(filePath: string): Promise<{
	buffer: Uint8Array;
	mimeType: string;
	relativePath: string;
}> {
	const relativePath = normalizeWorkspaceRelativePath(filePath);
	const absolutePath = path.join(WORKSPACE_ROOT, relativePath);
	const extension = path.extname(absolutePath).toLowerCase();

	if (!IMAGE_EXTENSIONS.has(extension)) {
		throw new Error('Only image assets can be previewed here.');
	}

	const details = await stat(absolutePath);
	if (!details.isFile()) {
		throw new Error('Image asset not found.');
	}

	const buffer = await readFile(absolutePath);
	const mimeType =
		extension === '.svg'
			? 'image/svg+xml'
			: extension === '.jpg'
				? 'image/jpeg'
				: `image/${extension.slice(1)}`;

	return { buffer, mimeType, relativePath };
}