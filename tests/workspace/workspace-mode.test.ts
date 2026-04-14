import { describe, it, expect, beforeEach } from 'vitest';
import {
	getActiveMode,
	getSelectedId,
	getActiveSelectedId,
	setMode,
	nextMode,
	prevMode,
	selectItem,
	resetSelections,
} from '../../src/modules/workspace/stores/workspace-mode.svelte.js';

beforeEach(() => {
	setMode('arcs');
	resetSelections();
});

describe('workspace-mode store', () => {
	it('defaults to arcs mode', () => {
		expect(getActiveMode()).toBe('arcs');
	});

	it('setMode changes the active mode', () => {
		setMode('chapters');
		expect(getActiveMode()).toBe('chapters');
	});

	it('nextMode cycles forward through modes', () => {
		expect(getActiveMode()).toBe('arcs');
		nextMode();
		expect(getActiveMode()).toBe('acts');
		nextMode();
		expect(getActiveMode()).toBe('chapters');
		nextMode();
		expect(getActiveMode()).toBe('scenes');
	});

	it('nextMode wraps from scenes to arcs', () => {
		setMode('scenes');
		nextMode();
		expect(getActiveMode()).toBe('arcs');
	});

	it('prevMode cycles backward through modes', () => {
		setMode('scenes');
		prevMode();
		expect(getActiveMode()).toBe('chapters');
		prevMode();
		expect(getActiveMode()).toBe('acts');
		prevMode();
		expect(getActiveMode()).toBe('arcs');
	});

	it('prevMode wraps from arcs to scenes', () => {
		setMode('arcs');
		prevMode();
		expect(getActiveMode()).toBe('scenes');
	});

	it('selectItem sets the id for a specific mode only', () => {
		selectItem('chapters', 'ch-1');
		expect(getSelectedId('chapters')).toBe('ch-1');
		expect(getSelectedId('arcs')).toBeNull();
		expect(getSelectedId('acts')).toBeNull();
		expect(getSelectedId('scenes')).toBeNull();
	});

	it('getActiveSelectedId returns the selected id for the current mode', () => {
		setMode('acts');
		selectItem('acts', 'act-42');
		expect(getActiveSelectedId()).toBe('act-42');
	});

	it('switching modes preserves previous selection', () => {
		selectItem('arcs', 'arc-1');
		setMode('chapters');
		selectItem('chapters', 'ch-5');
		setMode('arcs');
		expect(getActiveSelectedId()).toBe('arc-1');
	});

	it('selectItem with null clears the selection', () => {
		selectItem('scenes', 'sc-1');
		expect(getSelectedId('scenes')).toBe('sc-1');
		selectItem('scenes', null);
		expect(getSelectedId('scenes')).toBeNull();
	});

	it('resetSelections clears all selections', () => {
		selectItem('arcs', 'a-1');
		selectItem('acts', 'act-1');
		selectItem('chapters', 'ch-1');
		selectItem('scenes', 'sc-1');
		resetSelections();
		expect(getSelectedId('arcs')).toBeNull();
		expect(getSelectedId('acts')).toBeNull();
		expect(getSelectedId('chapters')).toBeNull();
		expect(getSelectedId('scenes')).toBeNull();
	});
});
