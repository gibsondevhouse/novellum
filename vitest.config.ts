import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
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
		},
	},
});
