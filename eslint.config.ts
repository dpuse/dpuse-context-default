/**
 * ESLint configuration.
 */

// Dependencies - Vendor.
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

// Exposures - Configuration.
export default [
    {
        files: ['vite.config.ts', 'src/*.ts'],
        languageOptions: { parser: tseslintParser, parserOptions: { project: './tsconfig.json' } },
        plugins: {
            '@typescript-eslint': tseslint,
            import: importPlugin
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/no-import-type-side-effects': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',

            'import/no-duplicates': 'off',
            'sort-imports': ['warn', { allowSeparatedGroups: true, ignoreCase: true, memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'] }],

            'no-empty': 'warn',
            'prefer-const': 'warn'
        }
    }
];
