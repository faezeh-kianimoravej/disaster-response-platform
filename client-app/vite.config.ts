/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],

				// SPA fallback - but deny API/auth routes
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [
					/^\/api\//,           // Never fallback for API routes
					/^\/realms\//,        // Never fallback for Keycloak realms
					/^\/protocol\//,      // Never fallback for Keycloak protocol
					/^\/_/,               // Never fallback for system routes
					/\/[^/?]+\.[^/]+$/,   // Never fallback for files with extensions
					/\/stream/,           // Never fallback for SSE streams
					/\/notifications\//,  // Never fallback for notification endpoints
				],

				// DISABLE runtime caching entirely to prevent SW interference
				runtimeCaching: [],

				skipWaiting: true,
				clientsClaim: true,
				
				// Generate SW that explicitly ignores external requests
				mode: 'generateSW',
				
				// Custom service worker configuration to avoid intercepting API calls
				additionalManifestEntries: undefined,
			},


			manifest: {
				id: '/',
				name: 'Disaster Response Crisis Communication System',
				short_name: 'DRCCS',
				description: 'Emergency response management system for crisis coordination',
				theme_color: '#1e40af',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/favicon.jpg',
						sizes: '428x393',
						type: 'image/jpeg',
						purpose: 'any',
					},
				],
				categories: ['productivity', 'utilities'],
				lang: 'en',
				orientation: 'any',
			},
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	preview: {
		port: 3000,
		open: true,
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
