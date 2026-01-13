/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		open: true,
	},
	preview: {
		host: true,
		allowedHosts: ['pc-ben', 'PC-Ben', 'localhost', '192.168.1.141'],
		https: {
			cert: fs.readFileSync(path.join(__dirname, 'PC-Ben+2.pem')),
			key: fs.readFileSync(path.join(__dirname, 'PC-Ben+2-key.pem')),
		},
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			output: {
                manualChunks: {
                    'react-core': ['react', 'react-dom'],
                    'react-router': ['react-router-dom'],
                    'react-hook-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
                    'react-query': ['@tanstack/react-query'],
                    'axios': ['axios'],
                    'lucide': ['lucide-react'],
                    'keycloak': ['keycloak-js'],
                },
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		include: [
			'src/test/logic/**/*.test.{ts,tsx}',
			'src/test/smoke/**/*.test.{ts,tsx}',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'cobertura'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.test.{ts,tsx}',
				'**/*.config.{ts,js}',
				'coverage/**',
				'build/**',
			],
		},
		// Produce a JUnit report in CI only so local `vitest` UX isn't affected
		reporters: ((): any => {
			const r: any[] = [];
			if (process.env.CI || process.env.GITLAB_CI) {
				r.push(['junit', { outputFile: 'test-results/junit.xml' }]);
			}
			return r;
		})(),
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
