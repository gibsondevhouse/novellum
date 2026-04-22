import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'en' | 'es';

const LOCALE_STORAGE_KEY = 'novellum.locale';
export const DEFAULT_LOCALE: Locale = 'en';

const DICTIONARIES: Record<Locale, Record<string, string>> = {
	en,
	es,
};

export const SUPPORTED_LOCALES = Object.keys(DICTIONARIES) as Locale[];

function isSupportedLocale(value: string | null | undefined): value is Locale {
	return value === 'en' || value === 'es';
}

function normalizeLocale(value: string | null | undefined): Locale {
	if (!value) return DEFAULT_LOCALE;
	const lowered = value.toLowerCase();
	if (isSupportedLocale(lowered)) return lowered;
	const short = lowered.split('-')[0];
	if (isSupportedLocale(short)) return short;
	return DEFAULT_LOCALE;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
	if (!params) return template;
	return template.replace(/\{([\w.]+)\}/g, (_match, key: string) => {
		const value = params[key];
		return value === undefined || value === null ? '' : String(value);
	});
}

export const locale = writable<Locale>(DEFAULT_LOCALE);

export function setDocumentLang(nextLocale: Locale): void {
	if (!browser) return;
	document.documentElement.lang = nextLocale;
}

export function setLocale(nextLocale: string): Locale {
	const normalized = normalizeLocale(nextLocale);
	locale.set(normalized);
	setDocumentLang(normalized);
	if (browser) {
		window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
	}
	return normalized;
}

export function initLocale(): Locale {
	if (!browser) return DEFAULT_LOCALE;
	const persisted = window.localStorage.getItem(LOCALE_STORAGE_KEY);
	const fromNavigator = normalizeLocale(window.navigator.language);
	const resolved = normalizeLocale(persisted ?? fromNavigator);
	return setLocale(resolved);
}

export function translate(
	currentLocale: Locale,
	key: string,
	params?: Record<string, string | number>,
): string {
	const message =
		DICTIONARIES[currentLocale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
	return interpolate(message, params);
}

export function translateWithFallback(
	currentLocale: Locale,
	key: string,
	fallback: string,
	params?: Record<string, string | number>,
): string {
	const message =
		DICTIONARIES[currentLocale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? fallback;
	return interpolate(message, params);
}

export function t(key: string, params?: Record<string, string | number>): string {
	return translate(get(locale), key, params);
}

export function tWithFallback(
	key: string,
	fallback: string,
	params?: Record<string, string | number>,
): string {
	return translateWithFallback(get(locale), key, fallback, params);
}

export const translator = derived(locale, ($locale) => {
	return (key: string, params?: Record<string, string | number>): string =>
		translate($locale, key, params);
});
