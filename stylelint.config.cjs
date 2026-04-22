module.exports = {
	extends: ['stylelint-config-standard', 'stylelint-config-html'],
	ignoreFiles: ['.svelte-kit/**', 'build/**', 'coverage/**', 'tests/visual/**'],
	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['tailwind', 'layer', 'apply', 'variants', 'responsive', 'screen'],
			},
		],
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			},
		],
		'no-descending-specificity': null,
	},
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html',
		},
	],
};
