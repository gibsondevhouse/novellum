/**
 * Sidebar collapsed state — singleton store.
 *
 * Lifted out of `AppSidebar.svelte` so the global keyboard shortcut handler
 * (and any other surface) can toggle it without DOM coupling.
 *
 * The current value is intentionally not persisted — the sidebar always
 * launches expanded so first-run users can discover navigation.
 */

class SidebarStore {
	collapsed = $state(false);

	toggle(): void {
		this.collapsed = !this.collapsed;
	}

	set(value: boolean): void {
		this.collapsed = value;
	}
}

export const sidebar = new SidebarStore();
