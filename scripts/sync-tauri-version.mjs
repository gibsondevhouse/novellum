#!/usr/bin/env node
/**
 * Single source of truth for the desktop bundle version.
 *
 * Reads `package.json#version`, writes it to:
 *   - `src-tauri/tauri.conf.json#version`
 *   - `src-tauri/Cargo.toml` `[package] version`
 *
 * Run by `pnpm version:sync`, and as a `predesktop:build` hook in
 * `package.json` so packaged installers can never drift from the
 * npm package version.
 *
 * Idempotent: rewrites the files only when the version differs.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const pkgPath = path.join(root, 'package.json');
const tauriConfPath = path.join(root, 'src-tauri', 'tauri.conf.json');
const cargoTomlPath = path.join(root, 'src-tauri', 'Cargo.toml');

async function readJson(p) {
	return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function writeJson(p, value) {
	const text = JSON.stringify(value, null, 2) + '\n';
	await fs.writeFile(p, text, 'utf8');
}

async function syncCargoVersion(filePath, version) {
	const original = await fs.readFile(filePath, 'utf8');
	// Replace only the version line inside `[package]`. We assume the
	// `[package]` block comes first (true for `tauri init` output and
	// for our edited Cargo.toml). The regex anchors on `^version =`
	// in multiline mode and replaces the first match.
	const next = original.replace(
		/^version\s*=\s*"[^"]*"/m,
		`version = "${version}"`,
	);
	if (next !== original) {
		await fs.writeFile(filePath, next, 'utf8');
		return true;
	}
	return false;
}

const pkg = await readJson(pkgPath);
const version = pkg.version;
if (typeof version !== 'string' || version.length === 0) {
	console.error('package.json#version is missing or empty');
	process.exit(1);
}

const tauriConf = await readJson(tauriConfPath);
let tauriChanged = false;
if (tauriConf.version !== version) {
	tauriConf.version = version;
	await writeJson(tauriConfPath, tauriConf);
	tauriChanged = true;
}

const cargoChanged = await syncCargoVersion(cargoTomlPath, version);

if (tauriChanged || cargoChanged) {
	console.log(
		`version:sync → ${version} (tauri.conf.json: ${tauriChanged ? 'updated' : 'ok'}, Cargo.toml: ${cargoChanged ? 'updated' : 'ok'})`,
	);
} else {
	console.log(`version:sync → ${version} (already in sync)`);
}
