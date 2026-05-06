#!/usr/bin/env node
/**
 * Usage: node scripts/generate-changelog.mjs [version]
 * Reads git log since the last tag and prints a CHANGELOG.md entry to stdout.
 */
import { execSync } from 'child_process';

const version = process.argv[2] ?? 'UNRELEASED';

const since = (() => {
	try {
		return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
	} catch {
		return '';
	}
})();

const range = since ? `${since}..HEAD` : 'HEAD';
const log = execSync(`git log ${range} --oneline --no-decorate`, { encoding: 'utf8' })
	.trim()
	.split('\n')
	.filter(Boolean)
	.map((line) => `- ${line}`)
	.join('\n');

const date = new Date().toISOString().slice(0, 10);
const entry = `## [${version}] — ${date}\n\n${log || '- No changes logged.'}\n`;

process.stdout.write(entry);
