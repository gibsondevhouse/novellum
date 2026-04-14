import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredTheme, storeTheme, applyTheme } from '../../src/modules/settings/services/themeService';

describe('themeService', () => {
	let store: Record<string, string> = {};

	beforeEach(() => {
		// Mock localStorage for the tests
		const localStorageMock = {
			getItem: vi.fn((key) => store[key] || null),
			setItem: vi.fn((key, value) => {
				store[key] = value.toString();
			}),
			clear: vi.fn(() => {
				store = {};
			}),
			removeItem: vi.fn()
		};
		vi.stubGlobal('localStorage', localStorageMock);
		
		store = {};
		document.documentElement.removeAttribute('data-theme');
		vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
			matches: query === '(prefers-color-scheme: dark)',
		})));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('getStoredTheme returns system when empty', () => {
		expect(getStoredTheme()).toBe('system');
	});

	it('getStoredTheme returns stored theme', () => {
		localStorage.setItem('novellum-theme', 'light');
		expect(getStoredTheme()).toBe('light');
	});

	it('storeTheme saves to localStorage', () => {
		storeTheme('dark');
		expect(localStorage.getItem('novellum-theme')).toBe('dark');
	});

	it('applyTheme sets data-theme to light', () => {
		applyTheme('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
	});

	it('applyTheme sets data-theme dynamically for system', () => {
		applyTheme('system');
		// matches prefers-color-scheme: dark in our stub
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});
});
