import { describe, it, expect } from 'vitest';
import {
	buildManifest,
	validateManifest,
	BACKUP_FORMAT,
	BACKUP_FORMAT_VERSION,
} from '$lib/server/backup/manifest.js';
import { APP_VERSION } from '$lib/version.js';

const baseProject = { id: 'p1', title: 'My Project', type: 'novel' };

describe('buildManifest', () => {
	it('produces a manifest with every required field populated', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: { projects: 1, chapters: 3 },
		});
		expect(m.format).toBe(BACKUP_FORMAT);
		expect(m.formatVersion).toBe(BACKUP_FORMAT_VERSION);
		expect(m.appVersion).toBe(APP_VERSION);
		expect(m.schemaVersion).toBe(2);
		expect(m.project).toEqual(baseProject);
		expect(m.tables).toEqual({ projects: 1, chapters: 3 });
		expect(m.compatibility.createdBy).toBe('Novellum');
		expect(m.compatibility.minAppVersion).toBe(APP_VERSION);
		expect(() => Date.parse(m.exportedAt)).not.toThrow();
	});

	it('respects an explicit exportedAt and minAppVersion', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 5,
			tableCounts: {},
			exportedAt: '2026-01-01T00:00:00.000Z',
			minAppVersion: '0.9.0',
		});
		expect(m.exportedAt).toBe('2026-01-01T00:00:00.000Z');
		expect(m.compatibility.minAppVersion).toBe('0.9.0');
	});
});

describe('validateManifest', () => {
	it('round-trips a manifest through JSON', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: { projects: 1 },
		});
		const result = validateManifest(JSON.parse(JSON.stringify(m)));
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.manifest).toEqual(m);
	});

	it('rejects a non-object', () => {
		expect(validateManifest('nope').ok).toBe(false);
		expect(validateManifest(null).ok).toBe(false);
		expect(validateManifest([]).ok).toBe(false);
	});

	it('rejects wrong format', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: {},
		});
		const tampered = { ...JSON.parse(JSON.stringify(m)), format: 'something.else' };
		const r = validateManifest(tampered);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.reason).toMatch(/unsupported format/i);
	});

	it('rejects a future formatVersion', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: {},
		});
		const tampered = {
			...JSON.parse(JSON.stringify(m)),
			formatVersion: BACKUP_FORMAT_VERSION + 1,
		};
		const r = validateManifest(tampered);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.reason).toMatch(/formatVersion/);
	});

	it('rejects a missing project.id', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: {},
		});
		const tampered = JSON.parse(JSON.stringify(m));
		tampered.project.id = '';
		const r = validateManifest(tampered);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.reason).toMatch(/project\.id/);
	});

	it('rejects a non-integer table count', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: { projects: 1 },
		});
		const tampered = JSON.parse(JSON.stringify(m));
		tampered.tables.projects = -1;
		const r1 = validateManifest(tampered);
		expect(r1.ok).toBe(false);
		tampered.tables.projects = 1.5;
		const r2 = validateManifest(tampered);
		expect(r2.ok).toBe(false);
		tampered.tables.projects = 'hi';
		const r3 = validateManifest(tampered);
		expect(r3.ok).toBe(false);
	});

	it('rejects a malformed exportedAt', () => {
		const m = buildManifest({
			project: baseProject,
			schemaVersion: 2,
			tableCounts: {},
		});
		const tampered = { ...JSON.parse(JSON.stringify(m)), exportedAt: 'not-a-date' };
		expect(validateManifest(tampered).ok).toBe(false);
	});
});
