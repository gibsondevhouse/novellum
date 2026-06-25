import { mount, unmount } from 'svelte';
import { tick } from 'svelte';
import type { Component } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CharacterForm from '$modules/story-bible/components/CharacterForm.svelte';
import FactionForm from '$modules/story-bible/components/FactionForm.svelte';
import GlossaryTermForm from '$modules/story-bible/components/GlossaryTermForm.svelte';
import LocationForm from '$modules/story-bible/components/LocationForm.svelte';
import LoreEntryForm from '$modules/story-bible/components/LoreEntryForm.svelte';
import ThemeForm from '$modules/story-bible/components/ThemeForm.svelte';

function renderForm<Props extends Record<string, unknown>>(component: Component<Props>, props: Props) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const instance = mount(component, { target, props });
	return {
		target,
		submit: async () => {
			const form = target.querySelector('form');
			if (!form) throw new Error('Expected form to render.');
			form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
			await tick();
		},
		cleanup: () => {
			unmount(instance);
			target.remove();
		},
	};
}

describe('story bible dossier forms', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('blocks character and location saves without names', async () => {
		const characterSave = vi.fn();
		const character = renderForm(CharacterForm, {
			onSave: characterSave,
			onCancel: vi.fn(),
		});
		await character.submit();
		expect(characterSave).not.toHaveBeenCalled();
		expect(character.target.textContent).toContain('Name is required.');
		character.cleanup();

		const locationSave = vi.fn();
		const location = renderForm(LocationForm, {
			onSave: locationSave,
			onCancel: vi.fn(),
		});
		await location.submit();
		expect(locationSave).not.toHaveBeenCalled();
		expect(location.target.textContent).toContain('Name is required.');
		location.cleanup();
	});

	it('blocks faction, glossary, theme, and lore saves without required labels', async () => {
		const factionSave = vi.fn();
		const faction = renderForm(FactionForm, {
			onSave: factionSave,
			onCancel: vi.fn(),
		});
		await faction.submit();
		expect(factionSave).not.toHaveBeenCalled();
		expect(faction.target.textContent).toContain('Name is required.');
		faction.cleanup();

		const glossarySave = vi.fn();
		const glossary = renderForm(GlossaryTermForm, {
			onSave: glossarySave,
			onCancel: vi.fn(),
		});
		await glossary.submit();
		expect(glossarySave).not.toHaveBeenCalled();
		expect(glossary.target.textContent).toContain('Term is required.');
		glossary.cleanup();

		const themeSave = vi.fn();
		const theme = renderForm(ThemeForm, {
			onSave: themeSave,
			onCancel: vi.fn(),
		});
		await theme.submit();
		expect(themeSave).not.toHaveBeenCalled();
		expect(theme.target.textContent).toContain('Title is required.');
		theme.cleanup();

		const loreSave = vi.fn();
		const lore = renderForm(LoreEntryForm, {
			onSave: loreSave,
			onCancel: vi.fn(),
		});
		await lore.submit();
		expect(loreSave).not.toHaveBeenCalled();
		expect(lore.target.textContent).toContain('Title is required.');
		lore.cleanup();
	});

	it('submits normalized character data when required fields are valid', async () => {
		const onSave = vi.fn();
		const form = renderForm(CharacterForm, {
			onSave,
			onCancel: vi.fn(),
		});

		const name = form.target.querySelector<HTMLInputElement>('#story-bible-character-name');
		const role = form.target.querySelector<HTMLInputElement>('#story-bible-character-role');
		const traits = form.target.querySelector<HTMLInputElement>('#story-bible-character-traits');
		if (!name || !role || !traits) throw new Error('Expected character inputs.');

		name.value = ' Mira Vale ';
		name.dispatchEvent(new Event('input', { bubbles: true }));
		role.value = 'Navigator';
		role.dispatchEvent(new Event('input', { bubbles: true }));
		traits.value = 'decisive, loyal';
		traits.dispatchEvent(new Event('input', { bubbles: true }));

		await form.submit();

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Mira Vale',
				role: 'Navigator',
				traits: ['decisive', 'loyal'],
			}),
		);
		form.cleanup();
	});
});
