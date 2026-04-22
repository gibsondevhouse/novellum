import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/sveltekit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(svelte|ts)'],
	addons: ['@storybook/addon-a11y', '@storybook/addon-svelte-csf'],
	framework: {
		name: '@storybook/sveltekit',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	async viteFinal(viteConfig) {
		viteConfig.resolve ??= {};
		viteConfig.resolve.alias = {
			...(viteConfig.resolve.alias ?? {}),
			$lib: path.resolve(__dirname, '../src/lib'),
			$modules: path.resolve(__dirname, '../src/modules'),
		};
		return viteConfig;
	},
};

export default config;
