import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: { parser: tseslint.parser },
		},
	},
	// Apply TypeScript parser to Svelte 5 rune module files (.svelte.ts)
	{
		files: ['**/*.svelte.ts'],
		languageOptions: {
			parser: tseslint.parser,
		},
	},
	{ ignores: ['.svelte-kit/', 'dist/', 'build/'] },
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			// No base path configured — plain hrefs are correct for this app
			'svelte/no-navigation-without-resolve': 'off',
		},
	},
	{
		plugins: { boundaries },
		settings: {
			'boundaries/elements': [
				{ type: 'lib', pattern: ['src/lib/**'] },
				{ type: 'module-editor', pattern: ['src/modules/editor/**'] },
				{ type: 'module-bible', pattern: ['src/modules/bible/**'] },
				{ type: 'module-outliner', pattern: ['src/modules/outliner/**'] },
				{ type: 'module-project', pattern: ['src/modules/project/**'] },
				{ type: 'module-ai', pattern: ['src/modules/ai/**'] },
				{ type: 'module-consistency', pattern: ['src/modules/consistency/**'] },
				{ type: 'module-export', pattern: ['src/modules/export/**'] },
				{ type: 'routes', pattern: ['src/routes/**'] },
			],
		},
		rules: {
			'boundaries/dependencies': [
				2,
				{
					default: 'disallow',
					rules: [
						{
							from: [{ type: 'routes' }],
							allow: [
								{ to: { type: 'lib' } },
								{ to: { type: 'module-editor' } },
								{ to: { type: 'module-bible' } },
								{ to: { type: 'module-outliner' } },
								{ to: { type: 'module-project' } },
								{ to: { type: 'module-ai' } },
								{ to: { type: 'module-consistency' } },
								{ to: { type: 'module-export' } },
							],
						},
						{
							from: [{ type: 'module-export' }],
							allow: [
								{ to: { type: 'lib' } },
								{ to: { type: 'module-project' } },
								{ to: { type: 'module-editor' } },
							],
						},
						{ from: [{ type: 'module-editor' }], allow: [{ to: { type: 'lib' } }] },
						{ from: [{ type: 'module-bible' }], allow: [{ to: { type: 'lib' } }] },
						{
							from: [{ type: 'module-outliner' }],
							allow: [
								{ to: { type: 'lib' } },
								{ to: { type: 'module-editor' } },
								{ to: { type: 'module-project' } },
							],
						},
						{ from: [{ type: 'module-project' }], allow: [{ to: { type: 'lib' } }] },
						{ from: [{ type: 'module-ai' }], allow: [{ to: { type: 'lib' } }] },
						{ from: [{ type: 'module-consistency' }], allow: [{ to: { type: 'lib' } }] },
						{
							from: [{ type: 'lib' }],
							allow: [{ to: { type: 'lib' } }, { to: { type: 'module-consistency' } }],
						},
					],
				},
			],
		},
	},
);
