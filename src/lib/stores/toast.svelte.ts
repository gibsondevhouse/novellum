export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration: number;
}

let toasts = $state<Toast[]>([]);

export function getToasts(): Toast[] {
	return toasts;
}

export function toast(
	message: string,
	type: Toast['type'] = 'info',
	duration = 3500
): void {
	const id =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random()}`;

	toasts = [...toasts, { id, message, type, duration }];

	setTimeout(() => {
		dismissToast(id);
	}, duration);
}

export function dismissToast(id: string): void {
	toasts = toasts.filter((t) => t.id !== id);
}
