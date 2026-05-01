#!/usr/bin/env node
/**
 * Download official Node.js release binaries for every Tauri target
 * triple we ship and stage them under `src-tauri/binaries/` so the
 * Tauri bundler can pick them up via `bundle.externalBin`.
 *
 * Wired as a `predesktop:build` hook in `package.json` so that
 * `pnpm desktop:build` always has the bundled Node available before
 * `tauri build` runs.
 *
 * Behaviour:
 *   - Skips the download if the destination binary already exists.
 *   - Downloads the official archive + SHASUMS256.txt over HTTPS.
 *   - Verifies the SHA256 of the archive before extraction.
 *   - Extracts only the `node` (or `node.exe`) executable.
 *   - Writes to `src-tauri/binaries/node-<target-triple>` and
 *     chmods +x on POSIX.
 *
 * Extraction relies on the system `tar` (BSD tar on macOS / bsdtar
 * on Windows 10+ / GNU tar on Linux), which can read both .tar.gz
 * and .zip archives. No third-party Node dependencies.
 *
 * Override the Node version with NODE_VERSION env var if needed
 * (e.g. `NODE_VERSION=v22.12.0 node scripts/fetch-node.mjs`).
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NODE_VERSION = process.env.NODE_VERSION ?? 'v22.11.0';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const binariesDir = path.join(repoRoot, 'src-tauri', 'binaries');

/**
 * Tauri externalBin target triples → Node release archive metadata.
 *
 * `archive` is the filename under `https://nodejs.org/dist/<v>/`.
 * `extractPath` is the path inside the archive to the executable.
 * `outName` is the destination filename Tauri expects (with the
 * platform extension; `.exe` on Windows).
 */
const TARGETS = [
	{
		triple: 'aarch64-apple-darwin',
		archive: `node-${NODE_VERSION}-darwin-arm64.tar.gz`,
		extractPath: `node-${NODE_VERSION}-darwin-arm64/bin/node`,
		outName: 'node-aarch64-apple-darwin',
	},
	{
		triple: 'x86_64-apple-darwin',
		archive: `node-${NODE_VERSION}-darwin-x64.tar.gz`,
		extractPath: `node-${NODE_VERSION}-darwin-x64/bin/node`,
		outName: 'node-x86_64-apple-darwin',
	},
	{
		triple: 'x86_64-pc-windows-msvc',
		archive: `node-${NODE_VERSION}-win-x64.zip`,
		extractPath: `node-${NODE_VERSION}-win-x64/node.exe`,
		outName: 'node-x86_64-pc-windows-msvc.exe',
	},
];

/** Filter targets: only fetch for the host's likely build matrix. */
function selectedTargets() {
	const requested = process.env.TARGET_TRIPLES;
	if (requested) {
		const wanted = new Set(requested.split(',').map((s) => s.trim()));
		return TARGETS.filter((t) => wanted.has(t.triple));
	}
	// Default: fetch for the current host platform only. CI matrices
	// can override with TARGET_TRIPLES=... to fetch all.
	const platform = process.platform;
	const arch = process.arch;
	if (platform === 'darwin') {
		return TARGETS.filter((t) =>
			arch === 'arm64'
				? t.triple === 'aarch64-apple-darwin'
				: t.triple === 'x86_64-apple-darwin',
		);
	}
	if (platform === 'win32') {
		return TARGETS.filter((t) => t.triple === 'x86_64-pc-windows-msvc');
	}
	// Linux build hosts cross-compile rarely; default to the macOS
	// arm64 binary so dev fetching works. CI overrides explicitly.
	return TARGETS.filter((t) => t.triple === 'aarch64-apple-darwin');
}

function distUrl(file) {
	return `https://nodejs.org/dist/${NODE_VERSION}/${file}`;
}

/** Download a URL to disk, following redirects. */
async function download(url, destPath) {
	await fsp.mkdir(path.dirname(destPath), { recursive: true });
	return new Promise((resolve, reject) => {
		const get = (currentUrl, redirectsLeft) => {
			https
				.get(currentUrl, (res) => {
					if (
						res.statusCode &&
						res.statusCode >= 300 &&
						res.statusCode < 400 &&
						res.headers.location
					) {
						if (redirectsLeft <= 0) {
							reject(new Error(`too many redirects for ${url}`));
							return;
						}
						res.resume();
						const next = new URL(res.headers.location, currentUrl).toString();
						get(next, redirectsLeft - 1);
						return;
					}
					if (res.statusCode !== 200) {
						reject(new Error(`GET ${currentUrl} → HTTP ${res.statusCode}`));
						res.resume();
						return;
					}
					const file = fs.createWriteStream(destPath);
					res.pipe(file);
					file.on('finish', () => file.close(() => resolve()));
					file.on('error', reject);
				})
				.on('error', reject);
		};
		get(url, 5);
	});
}

/** Compute SHA256 of a file. */
async function sha256OfFile(filePath) {
	return new Promise((resolve, reject) => {
		const hash = createHash('sha256');
		const stream = fs.createReadStream(filePath);
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', reject);
	});
}

/** Parse SHASUMS256.txt and find the line for a given filename. */
function shaFor(shasumsText, archiveName) {
	for (const line of shasumsText.split(/\r?\n/)) {
		const [hash, name] = line.trim().split(/\s+/);
		if (name === archiveName) return hash;
	}
	return null;
}

/** Run a subprocess to completion. */
function run(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { stdio: 'inherit', ...options });
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${command} ${args.join(' ')} → exit ${code}`));
		});
	});
}

/**
 * Extract a single file from a .tar.gz or .zip archive using the
 * system `tar`. BSD tar (macOS, Windows 10+) and GNU tar (Linux)
 * both support reading zip archives via the `-x` flag.
 */
async function extractOne(archivePath, innerPath, destPath) {
	const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'novellum-node-'));
	try {
		await run('tar', ['-x', '-f', archivePath, '-C', tmpRoot, innerPath]);
		const extracted = path.join(tmpRoot, innerPath);
		await fsp.mkdir(path.dirname(destPath), { recursive: true });
		await fsp.copyFile(extracted, destPath);
	} finally {
		await fsp.rm(tmpRoot, { recursive: true, force: true });
	}
}

async function fetchTarget(target, shasumsText) {
	const outPath = path.join(binariesDir, target.outName);
	if (fs.existsSync(outPath)) {
		console.log(`fetch-node → ${target.triple}: already present, skipping`);
		return;
	}

	const expected = shaFor(shasumsText, target.archive);
	if (!expected) {
		throw new Error(
			`SHASUMS256.txt has no entry for ${target.archive} ` +
				`(NODE_VERSION=${NODE_VERSION})`,
		);
	}

	const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'novellum-node-dl-'));
	const archivePath = path.join(tmpRoot, target.archive);
	try {
		console.log(`fetch-node → ${target.triple}: downloading ${target.archive}`);
		await download(distUrl(target.archive), archivePath);

		const actual = await sha256OfFile(archivePath);
		if (actual !== expected) {
			throw new Error(
				`SHA256 mismatch for ${target.archive}\n  expected: ${expected}\n  actual:   ${actual}`,
			);
		}

		console.log(`fetch-node → ${target.triple}: extracting ${target.extractPath}`);
		await extractOne(archivePath, target.extractPath, outPath);

		if (process.platform !== 'win32' || !target.outName.endsWith('.exe')) {
			await fsp.chmod(outPath, 0o755);
		}

		const stat = await fsp.stat(outPath);
		const mb = (stat.size / 1024 / 1024).toFixed(1);
		console.log(`fetch-node → ${target.triple}: wrote ${outPath} (${mb} MB)`);
	} finally {
		await fsp.rm(tmpRoot, { recursive: true, force: true });
	}
}

async function main() {
	await fsp.mkdir(binariesDir, { recursive: true });

	const targets = selectedTargets();
	if (targets.length === 0) {
		console.log('fetch-node: no targets selected for this host; nothing to do');
		return;
	}

	const shasumsPath = path.join(
		await fsp.mkdtemp(path.join(os.tmpdir(), 'novellum-node-shas-')),
		'SHASUMS256.txt',
	);
	try {
		await download(distUrl('SHASUMS256.txt'), shasumsPath);
		const shasumsText = await fsp.readFile(shasumsPath, 'utf8');

		for (const target of targets) {
			await fetchTarget(target, shasumsText);
		}
	} finally {
		await fsp.rm(path.dirname(shasumsPath), { recursive: true, force: true });
	}
}

await main();
