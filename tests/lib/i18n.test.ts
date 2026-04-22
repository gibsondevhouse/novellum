import { describe, expect, it } from 'vitest';
import {
	DEFAULT_LOCALE,
	locale,
	setLocale,
	translate,
	translateWithFallback,
} from '../../src/lib/i18n/index.js';

describe('i18n runtime', () => {
	it('translates known keys for english and spanish dictionaries', () => {
		expect(translate('en', 'worldbuilding.section.characters')).toBe('Personae');
		expect(translate('es', 'worldbuilding.section.characters')).toBe('Personajes');
	});

	it('falls back to default dictionary when locale key is missing', () => {
		expect(translate('es', 'worldbuilding.workspace.common.firstEraEvent')).toBe(
			'+ Añadir primer evento de era',
		);
		expect(translate('es', 'worldbuilding.section.plot-threads')).toBe('Hilos');
	});

	it('falls back to provided string when key is unknown in dictionaries', () => {
		expect(translateWithFallback('es', 'missing.key', 'Fallback value')).toBe('Fallback value');
		expect(translateWithFallback('en', 'missing.key', 'Hello {name}', { name: 'Nova' })).toBe(
			'Hello Nova',
		);
	});

	it('normalizes locale inputs and updates the locale store', () => {
		expect(setLocale('ES-mx')).toBe('es');
		expect(setLocale('unknown-locale')).toBe(DEFAULT_LOCALE);
		expect(setLocale('en')).toBe('en');
		expect(locale).toBeDefined();
	});
});
