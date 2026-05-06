import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
	},
	ssr: {
		external: ['better-sqlite3'],
	},
	build: {
		// Report actual gzipped sizes in build output
		reportCompressedSize: true,
		rollupOptions: {
			output: {
				// Split vendor, db, and ai chunks separately for better caching
				manualChunks(id) {
					if (id.includes('node_modules/dexie')) return 'vendor-dexie';
					if (id.includes('node_modules')) return 'vendor';
					if (id.includes('src/lib/ai')) return 'ai';
					if (id.includes('src/lib/repositories')) return 'repositories';
				},
			},
		},
	},
});
