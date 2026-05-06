/**
 * Appearance store — editor font size + line spacing.
 *
 * Singleton, module-load instantiation, lazy hydrate via `appearance.hydrate()`.
 * Mirrors the pattern of `reader-mode.svelte.ts` and `model-selection.svelte.ts`.
 *
 * Lives in `$lib/stores` (not `$modules/settings/stores`) so plan-023 stage-007
 * can consume it from `module-editor` (boundaries: `module-editor → lib` is
 * already allowed).
 *
 * SSR-safe: `hydrate()` and the apply* helpers no-op when `document` is
 * undefined, so the singleton can be imported on the server without effects.
 */
import { getPreference, setPreference } from '$lib/preferences.js';

export type EditorFontSize = 'small' | 'default' | 'large';
export type EditorLineSpacing = 'tight' | 'normal' | 'relaxed';

export const FONT_SIZE_KEY = 'app.editor.fontSize';
export const LINE_SPACING_KEY = 'app.editor.lineSpacing';

export const DEFAULT_FONT_SIZE: EditorFontSize = 'default';
export const DEFAULT_LINE_SPACING: EditorLineSpacing = 'relaxed';

const FONT_SIZE_TOKEN: Record<EditorFontSize, string> = {
	small: 'var(--text-sm)',
	default: 'var(--text-base)',
	large: 'var(--text-lg)',
};

const LINE_SPACING_TOKEN: Record<EditorLineSpacing, string> = {
	tight: 'var(--leading-tight)',
	normal: 'var(--leading-normal)',
	relaxed: 'var(--leading-relaxed)',
};

class AppearanceStore {
	fontSize = $state<EditorFontSize>(DEFAULT_FONT_SIZE);
	lineSpacing = $state<EditorLineSpacing>(DEFAULT_LINE_SPACING);
	hydrated = $state(false);

	async hydrate(): Promise<void> {
		const [fs, ls] = await Promise.all([
			getPreference<EditorFontSize>(FONT_SIZE_KEY, DEFAULT_FONT_SIZE),
			getPreference<EditorLineSpacing>(LINE_SPACING_KEY, DEFAULT_LINE_SPACING),
		]);
		this.fontSize = fs;
		this.lineSpacing = ls;
		this.applyFontSize();
		this.applyLineSpacing();
		this.hydrated = true;
	}

	setFontSize(value: EditorFontSize): void {
		this.fontSize = value;
		this.applyFontSize();
		void setPreference(FONT_SIZE_KEY, value);
	}

	setLineSpacing(value: EditorLineSpacing): void {
		this.lineSpacing = value;
		this.applyLineSpacing();
		void setPreference(LINE_SPACING_KEY, value);
	}

	private applyFontSize(): void {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty(
			'--editor-font-size',
			FONT_SIZE_TOKEN[this.fontSize],
		);
	}

	private applyLineSpacing(): void {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty(
			'--editor-line-height',
			LINE_SPACING_TOKEN[this.lineSpacing],
		);
	}
}

export const appearance = new AppearanceStore();
