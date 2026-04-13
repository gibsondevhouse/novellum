/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `novellum-${version}`;

// Assets to precache: SvelteKit build outputs + static files
const PRECACHE = [...build, ...files];

// Install: precache all assets
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
	self.skipWaiting();
});

// Activate: delete stale caches from prior versions
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
			),
	);
	self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for static assets.
// On chunk load failure (stale deploy), fall back to cache then signal reload.
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle same-origin requests
	if (url.origin !== self.location.origin) return;

	// Navigation requests: network-first, fall back to cache
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(() =>
				caches.match(request).then((r) => r ?? new Response('Offline', { status: 503 })),
			),
		);
		return;
	}

	// Static assets (JS/CSS chunks): cache-first, then network, then notify clients on chunk 404
	if (PRECACHE.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request).then((response) => {
					if (response.ok) {
						caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
					}
					return response;
				});
			}),
		);
		return;
	}

	// Dynamic chunks not in precache: network-first, notify clients on 404 (stale deploy)
	if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
		event.respondWith(
			fetch(request).catch(async () => {
				const cached = await caches.match(request);
				if (cached) return cached;
				// Chunk not available — signal all clients to perform a hard reload
				const clients = await self.clients.matchAll({ type: 'window' });
				clients.forEach((client) => client.postMessage({ type: 'STALE_CHUNK', url: request.url }));
				return new Response('Chunk unavailable', { status: 503 });
			}),
		);
	}
});
