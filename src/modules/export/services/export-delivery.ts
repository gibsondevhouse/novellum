import { getDesktop, isDesktop, type DesktopCapabilities } from '$lib/desktop/index.js';

export type ExportDeliveryStatus = 'downloaded' | 'saved' | 'cancelled';
export type ExportDeliveryMethod = 'browser' | 'desktop';

export interface ExportDeliveryResult {
	status: ExportDeliveryStatus;
	method: ExportDeliveryMethod;
	filename: string;
	path?: string;
}

export interface ExportDeliveryOptions {
	preference?: 'browser_download' | 'desktop_save' | 'auto';
}

interface ExportDeliveryDeps {
	desktop?: DesktopCapabilities;
	download?: typeof downloadBlobToBrowser;
	isDesktopRuntime?: () => boolean;
	writeDesktopFile?: (path: string, blob: Blob) => Promise<void>;
}

export class ExportDeliveryError extends Error {
	constructor(
		public readonly code: 'browser_download_failed' | 'desktop_save_failed',
		message: string,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = 'ExportDeliveryError';
	}
}

function isUnimplementedDesktopError(error: unknown): boolean {
	return (
		error instanceof Error && /not implemented|notYetImplemented|placeholder/i.test(error.message)
	);
}

export function downloadBlobToBrowser(blob: Blob, filename: string): void {
	if (typeof document === 'undefined' || typeof URL === 'undefined') {
		throw new ExportDeliveryError(
			'browser_download_failed',
			'Browser download is not available in this environment.',
		);
	}

	let url: string | null = null;
	let anchor: HTMLAnchorElement | null = null;
	try {
		url = URL.createObjectURL(blob);
		anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.style.display = 'none';
		document.body.appendChild(anchor);
		anchor.click();
	} catch (error) {
		throw new ExportDeliveryError('browser_download_failed', 'Failed to start download.', error);
	} finally {
		if (anchor?.parentNode) {
			anchor.parentNode.removeChild(anchor);
		}
		if (url) {
			URL.revokeObjectURL(url);
		}
	}
}

export async function deliverExportBlob(
	blob: Blob,
	filename: string,
	options: ExportDeliveryOptions = {},
	deps: ExportDeliveryDeps = {},
): Promise<ExportDeliveryResult> {
	const preference = options.preference ?? 'browser_download';
	const download = deps.download ?? downloadBlobToBrowser;
	const desktopRuntime = deps.isDesktopRuntime ?? isDesktop;
	const shouldTryDesktop = preference !== 'browser_download' && desktopRuntime();

	if (shouldTryDesktop) {
		try {
			const desktop = deps.desktop ?? (await getDesktop());
			const path = await desktop.pickSaveLocation(filename);
			if (!path) {
				return { status: 'cancelled', method: 'desktop', filename };
			}
			if (deps.writeDesktopFile) {
				await deps.writeDesktopFile(path, blob);
				return { status: 'saved', method: 'desktop', filename, path };
			}
		} catch (error) {
			if (!isUnimplementedDesktopError(error)) {
				if (preference === 'desktop_save') {
					throw new ExportDeliveryError('desktop_save_failed', 'Desktop save failed.', error);
				}
			}
		}
	}

	try {
		download(blob, filename);
		return { status: 'downloaded', method: 'browser', filename };
	} catch (error) {
		if (error instanceof ExportDeliveryError) {
			throw error;
		}
		throw new ExportDeliveryError('browser_download_failed', 'Failed to start download.', error);
	}
}
