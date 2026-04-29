import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		environment: 'jsdom',
		environmentOptions: {
			jsdom: { url: 'http://localhost/' },
		},
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		exclude: ['tests/visual/**', 'tests/e2e/**', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/modules/**/services/**', 'src/lib/ai/**'],
			exclude: [
				'src/lib/ai/openrouter.ts',
				'src/lib/ai/orchestrator.ts',
				'src/lib/ai/context-builder.ts',
				'src/lib/ai/serializer.ts',
			],
			thresholds: {
				lines: 80,
			},
		},
	},
	resolve: {
		alias: {
			$lib: resolve(__dirname, 'src/lib'),
			$modules: resolve(__dirname, 'src/modules'),
			$modules: resolve(__dirname, 'src/modules'),
		},
		conditions: ['browser'],
	},
});
