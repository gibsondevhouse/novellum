import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
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
