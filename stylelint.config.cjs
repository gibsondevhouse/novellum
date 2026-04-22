module.exports = {
	extends: ['stylelint-config-standard', 'stylelint-config-html'],
	ignoreFiles: ['.svelte-kit/**', 'build/**', 'coverage/**', 'tests/visual/**'],
	rules: {
		'alpha-value-notation': null,
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['tailwind', 'layer', 'apply', 'variants', 'responsive', 'screen'],
			},
		],
		'color-function-alias-notation': null,
		'color-function-notation': null,
		'color-hex-length': null,
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			},
		],
		'at-rule-empty-line-before': null,
		'comment-empty-line-before': null,
		'custom-property-empty-line-before': null,
		'custom-property-pattern': null,
		'declaration-block-single-line-max-declarations': null,
		'declaration-block-no-redundant-longhand-properties': null,
		'declaration-block-no-shorthand-property-overrides': null,
		'declaration-empty-line-before': null,
		'declaration-property-value-keyword-no-deprecated': null,
		'import-notation': null,
		'keyframes-name-pattern': null,
		'length-zero-no-unit': null,
		'media-feature-range-notation': null,
		'no-descending-specificity': null,
		'property-no-vendor-prefix': null,
		'rule-empty-line-before': null,
		'selector-class-pattern': null,
		'value-keyword-case': null,
	},
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html',
		},
	],
};
