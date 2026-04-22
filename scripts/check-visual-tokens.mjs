#!/usr/bin/env node

/**
 * Static Token Enforcement Script
 *
 * Scans .svelte file <style> blocks for hardcoded values that should use
 * design tokens instead.
 *
 * Rules enforced:
 *   RULE-T1: No hardcoded hex colors (#xxx, #xxxxxx, #xxxxxxxx) or raw
 *            rgb()/rgba() outside of CSS custom property definitions or
 *            var() fallbacks.
 *   RULE-T5: No raw box-shadow values without var(--shadow-*).
 *   RULE-T6: No raw transition/animation durations or easing functions
 *            without var(--duration-*) or var(--ease-*).
 *
 * Exceptions:
 *   - Token files in src/styles/ (`tokens.css`, `shadcn.css`)
 *   - Files in src/routes/styles/ (design system showcase)
 *
 * Exit codes:
 *   0 — no violations
 *   1 — violations found
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const SCAN_DIRS = [
	join(ROOT, 'src/routes'),
	join(ROOT, 'src/lib/components'),
	join(ROOT, 'src/modules'),
];

const CSS_SCAN_DIR = join(ROOT, 'src/styles');

const EXCEPTION_PREFIXES = [
	join(ROOT, 'src/routes/styles'),
];

const EXCEPTION_FILES = [
	join(ROOT, 'src/styles/tokens.css'),
	join(ROOT, 'src/styles/shadcn.css'),
];

// ── Helpers ──────────────────────────────────────────────────────────────

function collectSvelteFiles(dir) {
	const results = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		const full = join(dir, entry);
		const stat = statSync(full, { throwIfNoEntry: false });
		if (!stat) continue;
		if (stat.isDirectory()) {
			results.push(...collectSvelteFiles(full));
		} else if (entry.endsWith('.svelte')) {
			results.push(full);
		}
	}
	return results;
}

function collectCssFiles(dir) {
	const results = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		const full = join(dir, entry);
		const stat = statSync(full, { throwIfNoEntry: false });
		if (!stat) continue;
		if (stat.isDirectory()) {
			results.push(...collectCssFiles(full));
		} else if (entry.endsWith('.css')) {
			results.push(full);
		}
	}
	return results;
}

function isExcepted(filePath) {
	if (EXCEPTION_FILES.includes(filePath)) return true;
	return EXCEPTION_PREFIXES.some((prefix) => filePath.startsWith(prefix + '/') || filePath === prefix);
}

/**
 * Extract all <style> blocks from a Svelte file, returning each block
 * with its starting line number (1-based) relative to the file.
 */
function extractStyleBlocks(source) {
	const blocks = [];
	const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
	let match;
	while ((match = regex.exec(source)) !== null) {
		const before = source.slice(0, match.index + match[0].indexOf(match[1]));
		const startLine = before.split('\n').length;
		blocks.push({ css: match[1], startLine });
	}
	return blocks;
}

/**
 * Remove content inside var(...) so fallback hex values aren't flagged.
 * Also remove lines that define custom properties (--xxx: ...).
 */
function stripAllowedPatterns(css) {
	// Remove var() calls entirely (including nested ones)
	let cleaned = css;
	// Iteratively strip innermost var() first to handle nesting
	let prev;
	do {
		prev = cleaned;
		cleaned = cleaned.replace(/var\([^()]*\)/g, 'VAR_REMOVED');
	} while (cleaned !== prev);

	// Remove custom property definitions (lines like `--color-foo: #hex;`)
	cleaned = cleaned.replace(/--[\w-]+\s*:[^;]*/g, 'PROP_DEF_REMOVED');

	return cleaned;
}

// ── Rule Checkers ────────────────────────────────────────────────────────

/**
 * RULE-T1: No hardcoded hex colors or raw rgb()/rgba().
 * Checks for #xxx, #xxxx, #xxxxxx, #xxxxxxxx patterns and rgb()/rgba() calls.
 */
function checkHardcodedColors(css, startLine) {
	const violations = [];
	const cleaned = stripAllowedPatterns(css);
	const lines = cleaned.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNum = startLine + i;

		// Hex colors: #xxx, #xxxx, #xxxxxx, #xxxxxxxx
		const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
		let hexMatch;
		while ((hexMatch = hexRegex.exec(line)) !== null) {
			violations.push({
				rule: 'RULE-T1',
				line: lineNum,
				value: hexMatch[0],
				message: `Hardcoded hex color "${hexMatch[0]}" — use a var(--color-*) token instead`,
			});
		}

		// rgb() / rgba() calls
		const rgbRegex = /\brgba?\s*\([^)]*\)/gi;
		let rgbMatch;
		while ((rgbMatch = rgbRegex.exec(line)) !== null) {
			violations.push({
				rule: 'RULE-T1',
				line: lineNum,
				value: rgbMatch[0],
				message: `Hardcoded ${rgbMatch[0].slice(0, 4).trim()}() value — use a var(--color-*) token instead`,
			});
		}
	}

	return violations;
}

/**
 * RULE-T5: No raw box-shadow values without var(--shadow-*).
 * Flags box-shadow declarations that don't exclusively use token references.
 */
function checkShadowTokens(css, startLine) {
	const violations = [];
	const cleaned = stripAllowedPatterns(css);
	const lines = cleaned.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNum = startLine + i;

		// Match box-shadow property declarations
		const shadowRegex = /\bbox-shadow\s*:\s*([^;]+)/gi;
		let shadowMatch;
		while ((shadowMatch = shadowRegex.exec(line)) !== null) {
			const value = shadowMatch[1].trim();
			// Allow if the value is exclusively a VAR_REMOVED token or 'none' or 'inherit'/'unset'/'initial'
			if (/^(VAR_REMOVED|none|inherit|unset|initial|revert)\s*(!important)?$/i.test(value)) {
				continue;
			}
			violations.push({
				rule: 'RULE-T5',
				line: lineNum,
				value: `box-shadow: ${shadowMatch[1].trim().slice(0, 60)}`,
				message: 'Raw box-shadow value — use var(--shadow-*) token instead',
			});
		}
	}

	return violations;
}

/**
 * RULE-T6: No raw transition/animation durations or easing functions.
 * Flags numeric durations (e.g., 200ms, 0.3s) and named easing functions
 * (e.g., ease-in-out, cubic-bezier) in transition/animation properties.
 */
function checkMotionTokens(css, startLine) {
	const violations = [];
	const cleaned = stripAllowedPatterns(css);
	const lines = cleaned.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNum = startLine + i;

		// Match transition or animation property declarations
		const motionRegex = /\b(transition|animation|transition-duration|transition-timing-function|animation-duration|animation-timing-function)\s*:\s*([^;]+)/gi;
		let motionMatch;
		while ((motionMatch = motionRegex.exec(line)) !== null) {
			const value = motionMatch[2].trim();
			// Allow 'none', 'inherit', etc.
			if (/^(VAR_REMOVED|none|inherit|unset|initial|revert)\s*(!important)?$/i.test(value)) {
				continue;
			}

			// Check for hardcoded durations: digits followed by ms or s
			const durationRegex = /\b\d+(\.\d+)?(ms|s)\b/g;
			let durMatch;
			while ((durMatch = durationRegex.exec(value)) !== null) {
				violations.push({
					rule: 'RULE-T6',
					line: lineNum,
					value: durMatch[0],
					message: `Hardcoded duration "${durMatch[0]}" — use var(--duration-*) token instead`,
				});
			}

			// Check for hardcoded easing: cubic-bezier(), ease, ease-in, ease-out, ease-in-out, linear
			const easingRegex = /\b(cubic-bezier\s*\([^)]*\)|ease-in-out|ease-in|ease-out|ease(?!-))\b/gi;
			let easeMatch;
			while ((easeMatch = easingRegex.exec(value)) !== null) {
				violations.push({
					rule: 'RULE-T6',
					line: lineNum,
					value: easeMatch[0],
					message: `Hardcoded easing "${easeMatch[0]}" — use var(--ease-*) token instead`,
				});
			}
		}
	}

	return violations;
}

// ── Main ─────────────────────────────────────────────────────────────────

function main() {
	const allFiles = SCAN_DIRS.flatMap(collectSvelteFiles);
	const files = allFiles.filter((f) => !isExcepted(f));
	const cssFiles = collectCssFiles(CSS_SCAN_DIR).filter((f) => !isExcepted(f));

	let totalViolations = 0;
	const fileReports = [];

	for (const filePath of files) {
		const source = readFileSync(filePath, 'utf-8');
		const blocks = extractStyleBlocks(source);
		const violations = [];

		for (const block of blocks) {
			violations.push(
				...checkHardcodedColors(block.css, block.startLine),
				...checkShadowTokens(block.css, block.startLine),
				...checkMotionTokens(block.css, block.startLine),
			);
		}

		if (violations.length > 0) {
			const rel = relative(ROOT, filePath);
			fileReports.push({ file: rel, violations });
			totalViolations += violations.length;
		}
	}

	for (const filePath of cssFiles) {
		const source = readFileSync(filePath, 'utf-8');
		const violations = [
			...checkHardcodedColors(source, 1),
			...checkShadowTokens(source, 1),
			...checkMotionTokens(source, 1),
		];

		if (violations.length > 0) {
			const rel = relative(ROOT, filePath);
			fileReports.push({ file: rel, violations });
			totalViolations += violations.length;
		}
	}

	// ── Output ───────────────────────────────────────────────────────────
	if (totalViolations === 0) {
		console.log(
			`✓ Token enforcement: ${files.length + cssFiles.length} files scanned, 0 violations.`,
		);
		process.exit(0);
	}

	console.log(`\n✗ Token enforcement: ${totalViolations} violation(s) in ${fileReports.length} file(s)\n`);

	for (const report of fileReports) {
		console.log(`  ${report.file}`);
		for (const v of report.violations) {
			console.log(`    L${v.line}  [${v.rule}] ${v.message}`);
		}
		console.log('');
	}

	console.log(`${totalViolations} total violation(s) found.`);
	process.exit(1);
}

main();
