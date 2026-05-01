#!/usr/bin/env node
/**
 * Stage native runtime dependencies into `build/node_modules/` so the
 * SvelteKit Node-adapter server bundled inside the Tauri .app can
 * resolve its native bindings against the *bundled* Node sidecar's
 * ABI — not the developer's local Node version.
 *
 * Why this exists
 * ---------------
 * `@sveltejs/adapter-node` emits ESM that still requires native
 * modules (`better-sqlite3`, `@napi-rs/keyring`) at runtime. With no
 * `node_modules/` adjacent to the build output, Node's resolver
 * walks up the filesystem and — when the user happens to launch the
 * .app from inside the project tree — finds the dev machine's
 * `node_modules`. That binary was built against the developer's
 * local Node ABI (e.g. NODE_MODULE_VERSION 141 = Node 24), which
 * doesn't match the bundled Node 22 sidecar (NODE_MODULE_VERSION
 * 127), so every `/api/db/*` request returns 500 with:
 *
 *   The module was compiled against a different Node.js version
 *   using NODE_MODULE_VERSION X. This version of Node.js requires
 *   NODE_MODULE_VERSION Y.
 *
 * What this does
 * --------------
 *   1. Copies the runtime closure of native deps into
 *      `build/node_modules/` (dereferencing pnpm's symlinks).
 *   2. Re-downloads `better-sqlite3`'s native binary using
 *      `prebuild-install --target=<bundled-node-version>` so the
 *      `.node` file matches the sidecar's ABI.
 *   3. Leaves N-API modules (`@napi-rs/keyring-*`) untouched —
 *      N-API is ABI-stable across Node versions.
 *
 * The staged tree is shipped by Tauri's existing
 * `bundle.resources = ["../build/**\/*"]` glob, so no
 * `tauri.conf.json` changes are needed.
 */

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');
const BUILD_DIR = join(PROJECT_ROOT, 'build');
const STAGE_DIR = join(BUILD_DIR, 'node_modules');

// Must match scripts/fetch-node.mjs.
const NODE_VERSION = '22.11.0';

// Tauri target triple → npm-style {platform, arch}. Mirrors the
// table in scripts/fetch-node.mjs so the bundled Node and the
// staged native binaries always agree.
const TRIPLE_MAP = {
	'aarch64-apple-darwin': { platform: 'darwin', arch: 'arm64' },
	'x86_64-apple-darwin': { platform: 'darwin', arch: 'x64' },
	'x86_64-pc-windows-msvc': { platform: 'win32', arch: 'x64' },
	'aarch64-pc-windows-msvc': { platform: 'win32', arch: 'arm64' },
	'x86_64-unknown-linux-gnu': { platform: 'linux', arch: 'x64' },
	'aarch64-unknown-linux-gnu': { platform: 'linux', arch: 'arm64' },
};

function detectHostTriple() {
	const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
	if (process.platform === 'darwin') return `${arch}-apple-darwin`;
	if (process.platform === 'win32') return `${arch}-pc-windows-msvc`;
	if (process.platform === 'linux') return `${arch}-unknown-linux-gnu`;
	throw new Error(`unsupported platform ${process.platform}`);
}

const targetTriple =
	process.env.NOVELLUM_TARGET_TRIPLE ||
	process.env.TAURI_ENV_TARGET_TRIPLE ||
	detectHostTriple();

const target = TRIPLE_MAP[targetTriple];
if (!target) {
	console.error(`prepare-sidecar-deps: unknown target triple ${targetTriple}`);
	process.exit(1);
}

console.log(
	`prepare-sidecar-deps: target=${targetTriple} (${target.platform}/${target.arch}) node=${NODE_VERSION}`,
);

if (!existsSync(BUILD_DIR)) {
	console.error(
		'prepare-sidecar-deps: build/ does not exist; run `pnpm build` first',
	);
	process.exit(1);
}

rmSync(STAGE_DIR, { recursive: true, force: true });
mkdirSync(STAGE_DIR, { recursive: true });

function copyPackage(name) {
	const directPath = join(PROJECT_ROOT, 'node_modules', name);
	let src = directPath;
	if (!existsSync(src)) {
		// Transitive deps under pnpm aren't hoisted into the root
		// `node_modules/`. Resolve via the .pnpm virtual store.
		src = resolveFromPnpmStore(name);
	}
	if (!src || !existsSync(src)) {
		console.error(
			`prepare-sidecar-deps: ${name} not found (looked in ${directPath} and .pnpm store)`,
		);
		process.exit(1);
	}
	const dst = join(STAGE_DIR, name);
	mkdirSync(dirname(dst), { recursive: true });
	// dereference: true follows pnpm's symlinks to the real package
	// inside .pnpm/, giving us a self-contained tree we can ship.
	cpSync(src, dst, { recursive: true, dereference: true });
	console.log(`  copied ${name}`);
}

function resolveFromPnpmStore(name) {
	const pnpmRoot = join(PROJECT_ROOT, 'node_modules', '.pnpm');
	if (!existsSync(pnpmRoot)) return null;
	// Match `<scope-prefix><name>@<version>/node_modules/<name>`.
	// Scoped packages have `/` rewritten as `+` by pnpm, so the
	// directory name for `@napi-rs/keyring@1.2.0` is
	// `@napi-rs+keyring@1.2.0`. We accept the @scope/ form here and
	// translate it.
	const dirEncoded = name.replace('/', '+');
	const entries = readdirSync(pnpmRoot);
	const match = entries.find((entry) => entry.startsWith(`${dirEncoded}@`));
	if (!match) return null;
	return join(pnpmRoot, match, 'node_modules', name);
}

// better-sqlite3 + its non-optional runtime deps.
copyPackage('better-sqlite3');
copyPackage('bindings');
copyPackage('file-uri-to-path');

// @napi-rs/keyring + the platform binary package pnpm installed
// for the host. For cross-target builds the developer is
// responsible for ensuring the right `@napi-rs/keyring-<plat>-<arch>`
// is in their lockfile (CI matrix already pins per-runner deps).
copyPackage('@napi-rs/keyring');
const keyringPlatformPkg = `@napi-rs/keyring-${target.platform}-${target.arch}`;
if (
	existsSync(join(PROJECT_ROOT, 'node_modules', keyringPlatformPkg)) ||
	resolveFromPnpmStore(keyringPlatformPkg)
) {
	copyPackage(keyringPlatformPkg);
} else {
	console.warn(
		`prepare-sidecar-deps: ${keyringPlatformPkg} not installed; ` +
			'keyring will fall back to encrypted file store at runtime.',
	);
}

// Replace the locally-built better-sqlite3 .node with the prebuilt
// binary for the bundled Node version's ABI.
const bsqDir = join(STAGE_DIR, 'better-sqlite3');
rmSync(join(bsqDir, 'build', 'Release'), { recursive: true, force: true });

// Resolve prebuild-install via the .pnpm store and invoke it
// directly with `node` so we don't rely on the .bin shim, whose
// relative path target is fragile under pnpm.
const prebuildInstallPkg = resolveFromPnpmStore('prebuild-install');
if (!prebuildInstallPkg) {
	console.error('prepare-sidecar-deps: prebuild-install package not found');
	process.exit(1);
}
const prebuildInstallBin = join(prebuildInstallPkg, 'bin.js');

const result = spawnSync(
	process.execPath,
	[
		prebuildInstallBin,
		`--target=${NODE_VERSION}`,
		'--runtime=node',
		`--platform=${target.platform}`,
		`--arch=${target.arch}`,
		'--verbose',
	],
	{ cwd: bsqDir, stdio: 'inherit' },
);

if (result.status !== 0) {
	console.error(
		`prepare-sidecar-deps: prebuild-install exited with ${result.status}`,
	);
	process.exit(1);
}

console.log('prepare-sidecar-deps: done');
