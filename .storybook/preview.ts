import type { Preview } from '@storybook/svelte';
import { setLocale } from '../src/lib/i18n';
import '../src/app.css';

const preview: Preview = {
	globalTypes: {
		locale: {
			name: 'Locale',
			description: 'Preview locale',
			defaultValue: 'en',
			toolbar: {
				title: 'Locale',
				items: [
					{ value: 'en', title: 'English' },
					{ value: 'es', title: 'Español' },
				],
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			if (typeof document !== 'undefined') {
				document.documentElement.classList.add('dark');
				setLocale(context.globals.locale ?? 'en');
			}
			return Story();
		},
	],
	parameters: {
		layout: 'fullscreen',
		controls: {
			expanded: true,
		},
	},
};

export default preview;
