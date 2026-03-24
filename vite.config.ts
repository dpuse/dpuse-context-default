/**
 * Vite configuration.
 */

// Dependencies - Vendor.
import config from './config.json';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

// Exposures - Configuration.
export default defineConfig({
    build: {
        lib: {
            entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
            name: 'DPUseDefaultContext',
            formats: ['es'],
            fileName: (format: string) => `${config.id}.${format}.js`
        },
        rollupOptions: {
            external: ['csv-parse']
        },
        target: 'ESNext'
    },
    plugins: [dts({ outDir: 'dist/types' })],
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
            '@': fileURLToPath(new URL('src', import.meta.url))
        }
    }
});
