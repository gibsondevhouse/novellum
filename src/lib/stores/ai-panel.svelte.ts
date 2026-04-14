class AiPanelStore {
	isOpen = $state(false);
	isLoading = $state(false);
	suggestion = $state<string | null>(null);
	error = $state<string | null>(null);
	lastPrompt = $state('');

	get isActive() {
		return this.isLoading || this.suggestion !== null || this.error !== null;
	}

	toggle() {
		this.isOpen = !this.isOpen;
	}

	rejectSuggestion() {
		this.suggestion = null;
		this.error = null;
	}

	async requestSuggestion(prompt: string): Promise<void> {
		this.isLoading = true;
		this.error = null;
		this.suggestion = null;
		this.lastPrompt = prompt;

		try {
			const res = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt }),
			});
			if (!res.ok) throw new Error(`API error ${res.status}`);
			const data = await res.json();
			this.suggestion = data.content ?? null;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			this.isLoading = false;
		}
	}
}

export const aiPanel = new AiPanelStore();
