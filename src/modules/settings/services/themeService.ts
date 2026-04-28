import { setPreference } from '$lib/preferences.js';

export type Theme = 'dark' | 'light' | 'system';

const PREF_KEY = 'app.theme';

export function getStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem('novellum-theme');
		if (stored === 'dark' || stored === 'light' || stored === 'system') {
			return stored;
		}
	} catch {
		// Ignore localStorage access errors
	}
	return 'system';
}

export function storeTheme(theme: Theme): void {
	try {
		localStorage.setItem('novellum-theme', theme);
	} catch {
		// Ignore
	}
	// Mirror to SQLite for backup/restore coverage. The localStorage write is
	// retained as a synchronous read source for the FOUC-prevention bootstrap
	// script in src/app.html.
	void setPreference(PREF_KEY, theme);
}

export function applyTheme(theme: Theme): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;

	const root = document.documentElement;

	if (theme === 'system') {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
	} else {
		root.setAttribute('data-theme', theme);
	}
}
