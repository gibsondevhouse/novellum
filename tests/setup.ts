// Configure fake-indexeddb before any tests run
import 'fake-indexeddb/auto';

// Node 25 ships an experimental built-in `localStorage` global that is
// inert without --localstorage-file and shadows jsdom's window storage.
// Replace both bindings with a simple in-memory Storage implementation
// so unit tests can exercise the standard Web Storage API.
class MemoryStorage implements Storage {
	#data = new Map<string, string>();
	get length(): number {
		return this.#data.size;
	}
	clear(): void {
		this.#data.clear();
	}
	getItem(key: string): string | null {
		return this.#data.has(key) ? (this.#data.get(key) as string) : null;
	}
	key(index: number): string | null {
		return Array.from(this.#data.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.#data.delete(key);
	}
	setItem(key: string, value: string): void {
		this.#data.set(key, String(value));
	}
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
	value: memoryStorage,
	writable: true,
	configurable: true,
});
if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'localStorage', {
		value: memoryStorage,
		writable: true,
		configurable: true,
	});
}
