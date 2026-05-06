// Test stub for SvelteKit's $app/navigation runtime module.
import { vi } from 'vitest';

export const goto = vi.fn(async (_url: string | URL, _opts?: unknown) => {});
export const invalidate = vi.fn(async () => {});
export const invalidateAll = vi.fn(async () => {});
export const preloadCode = vi.fn(async () => {});
export const preloadData = vi.fn(async () => {});
export const beforeNavigate = vi.fn();
export const afterNavigate = vi.fn();
export const onNavigate = vi.fn();
export const pushState = vi.fn();
export const replaceState = vi.fn();
export const disableScrollHandling = vi.fn();
