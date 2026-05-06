import { getPreference, setPreference } from '$lib/preferences.js';

const LABS_KEY = 'app.labs.enabled';

function createFeatureFlags() {
	let labsEnabled = $state(false);
	let loaded = $state(false);

	async function hydrate() {
		labsEnabled = await getPreference<boolean>(LABS_KEY, false);
		loaded = true;
	}

	async function setLabsEnabled(value: boolean) {
		labsEnabled = value;
		await setPreference(LABS_KEY, value);
	}

	return {
		get labsEnabled() {
			return labsEnabled;
		},
		get loaded() {
			return loaded;
		},
		hydrate,
		setLabsEnabled,
	};
}

export const featureFlags = createFeatureFlags();
