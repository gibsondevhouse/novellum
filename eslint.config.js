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
	{ ignores: ['.svelte-kit/', 'dist/', 'build/', 'coverage/', 'src-tauri/target/', '*.cjs'] },
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
				{ type: 'legacy-dexie', pattern: ['src/lib/legacy/dexie/**'] },
				{
					type: 'legacy-allowed-consumer',
					pattern: [
						'src/lib/migration/**',
						'src/modules/outline/services/migrations/**',
						'src/modules/export/services/portability/**',
						'src/modules/export/services/__tests__/**',
						'src/modules/assets/**',
						'src/routes/settings/migrate/**',
					],
				},
				{ type: 'lib', pattern: ['src/lib/**'] },
				{ type: 'module-editor', pattern: ['src/modules/editor/**'] },
				{ type: 'module-outline', pattern: ['src/modules/outline/**'] },
				{ type: 'module-project', pattern: ['src/modules/project/**'] },
				{ type: 'module-ai', pattern: ['src/modules/ai/**'] },
				{ type: 'module-export', pattern: ['src/modules/export/**'] },
				{ type: 'module-world-building', pattern: ['src/modules/world-building/**'] },
				{ type: 'module-story-bible', pattern: ['src/modules/story-bible/**'] },
				{ type: 'module-continuity', pattern: ['src/modules/continuity/**'] },
				{ type: 'module-reader', pattern: ['src/modules/reader/**'] },
				{ type: 'module-nova', pattern: ['src/modules/nova/**'] },
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
							from: [{ type: 'legacy-allowed-consumer' }],
							allow: [
								{ to: { type: 'legacy-dexie' } },
								{ to: { type: 'lib' } },
								{ to: { type: 'legacy-allowed-consumer' } },
							],
						},
						{
							from: [{ type: 'routes' }],
							allow: [
								{ to: { type: 'lib' } },
								{ to: { type: 'module-editor' } },
								{ to: { type: 'module-outline' } },
								{ to: { type: 'module-project' } },
								{ to: { type: 'module-ai' } },
								{ to: { type: 'module-export' } },
							{ to: { type: 'module-world-building' } },
							{ to: { type: 'module-story-bible' } },
							{ to: { type: 'module-continuity' } },
								{ to: { type: 'module-reader' } },
								{ to: { type: 'module-nova' } },
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
						{
							from: [{ type: 'module-editor' }],
							allow: [{ to: { type: 'lib' } }, { to: { type: 'module-nova' } }],
						},
						{
							from: [{ type: 'module-nova' }],
							allow: [{ to: { type: 'lib' } }, { to: { type: 'module-ai' } }],
						},
						{
							from: [{ type: 'module-outline' }],
							allow: [
								{ to: { type: 'lib' } },
								{ to: { type: 'module-editor' } },
								{ to: { type: 'module-project' } },
							],
						},
						{ from: [{ type: 'module-project' }], allow: [{ to: { type: 'lib' } }] },
						{ from: [{ type: 'module-ai' }], allow: [{ to: { type: 'lib' } }] },
						{
							from: [{ type: 'module-world-building' }],
							allow: [{ to: { type: 'lib' } }],
						},
						{
							from: [{ type: 'module-story-bible' }],
							allow: [{ to: { type: 'lib' } }],
						},
						{
							from: [{ type: 'module-continuity' }],
							allow: [{ to: { type: 'lib' } }],
						},
						{ from: [{ type: 'module-reader' }], allow: [{ to: { type: 'lib' } }] },
						{
							from: [{ type: 'lib' }],
							allow: [{ to: { type: 'lib' } }, { to: { type: 'module-continuity' } }],
						},
					],
				},
			],
		},
	},
);
