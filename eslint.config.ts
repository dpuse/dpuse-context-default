// DPUse framework
import dpuse from '@dpuse/eslint-config-dpuse';

// ESLint configuration
export default [
    ...dpuse,
    {
        rules: {
            '@typescript-eslint/no-confusing-void-expression': 'off'
        }
    }
];
