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
	getParentContext,
	setParentContext,
	propagateParentFromSelection,
	resetParentContext,
	PARENT_MODE,
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

	it('resetSelections also clears parent context', () => {
		setParentContext('acts', 'arc-1');
		setParentContext('chapters', 'act-1');
		resetSelections();
		expect(getParentContext('acts')).toBeNull();
		expect(getParentContext('chapters')).toBeNull();
		expect(getParentContext('scenes')).toBeNull();
	});
});

describe('workspace-mode parent context', () => {
	it('PARENT_MODE maps child modes to parent modes', () => {
		expect(PARENT_MODE.acts).toBe('arcs');
		expect(PARENT_MODE.chapters).toBe('acts');
		expect(PARENT_MODE.scenes).toBe('chapters');
		expect(PARENT_MODE.arcs).toBeUndefined();
	});

	it('setParentContext and getParentContext work for each mode', () => {
		setParentContext('acts', 'arc-99');
		expect(getParentContext('acts')).toBe('arc-99');

		setParentContext('chapters', 'act-42');
		expect(getParentContext('chapters')).toBe('act-42');

		setParentContext('scenes', 'ch-7');
		expect(getParentContext('scenes')).toBe('ch-7');
	});

	it('setParentContext with null clears the context', () => {
		setParentContext('acts', 'arc-1');
		setParentContext('acts', null);
		expect(getParentContext('acts')).toBeNull();
	});

	it('propagateParentFromSelection sets child context from current selection', () => {
		selectItem('arcs', 'arc-5');
		propagateParentFromSelection('arcs');
		expect(getParentContext('acts')).toBe('arc-5');

		selectItem('acts', 'act-3');
		propagateParentFromSelection('acts');
		expect(getParentContext('chapters')).toBe('act-3');

		selectItem('chapters', 'ch-2');
		propagateParentFromSelection('chapters');
		expect(getParentContext('scenes')).toBe('ch-2');
	});

	it('propagateParentFromSelection with null selection sets null context', () => {
		setParentContext('acts', 'arc-1');
		selectItem('arcs', null);
		propagateParentFromSelection('arcs');
		expect(getParentContext('acts')).toBeNull();
	});

	it('propagateParentFromSelection on scenes mode does nothing (no child mode)', () => {
		selectItem('scenes', 'sc-1');
		propagateParentFromSelection('scenes');
		// No crash, no change
		expect(getParentContext('arcs')).toBeNull();
	});

	it('resetParentContext clears all parent contexts', () => {
		setParentContext('acts', 'arc-1');
		setParentContext('chapters', 'act-1');
		setParentContext('scenes', 'ch-1');
		resetParentContext();
		expect(getParentContext('acts')).toBeNull();
		expect(getParentContext('chapters')).toBeNull();
		expect(getParentContext('scenes')).toBeNull();
	});

	it('parent context persists across mode switches', () => {
		setParentContext('acts', 'arc-1');
		setMode('chapters');
		setMode('acts');
		expect(getParentContext('acts')).toBe('arc-1');
	});
});
