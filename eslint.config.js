// Dependencies - Vendor
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

// Exposures
/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/no-import-type-side-effects': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',

            'import/no-duplicates': 'off',
            'sort-imports': ['warn', { allowSeparatedGroups: true, ignoreCase: true, memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'] }],

            'no-empty': 'warn',
            'prefer-const': 'warn'
        }
    }
];
